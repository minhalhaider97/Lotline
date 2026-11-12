import json
from functools import lru_cache
from typing import Any

from groq import APIConnectionError, APITimeoutError, AsyncGroq, RateLimitError

from app.config import Settings
from app.errors import APIError
from app.models.api import HistoryTurn, ModelReply


@lru_cache(maxsize=1)
def _client(api_key: str, timeout: float) -> AsyncGroq:
    return AsyncGroq(api_key=api_key, timeout=timeout, max_retries=1)


def _get_client(settings: Settings) -> AsyncGroq:
    if not settings.groq_configured or not settings.groq_api_key:
        raise APIError(503, "AI_NOT_CONFIGURED", "The AI demo is not configured yet.")
    return _client(settings.groq_api_key.get_secret_value(), settings.groq_timeout_seconds)


async def create_chat_reply(
    *,
    settings: Settings,
    system_prompt: str,
    message: str,
    history: list[HistoryTurn],
) -> ModelReply:
    messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]
    messages.extend({"role": turn.role, "content": turn.content} for turn in history)
    messages.append({"role": "user", "content": message})

    try:
        result = await _get_client(settings).chat.completions.create(
            model=settings.groq_chat_model,
            messages=messages,
            temperature=0.2,
            max_completion_tokens=700,
            response_format={"type": "json_object"},
        )
    except RateLimitError as exc:
        raise APIError(
            429, "AI_SERVICE_BUSY", "The AI demo is busy. Please try again shortly."
        ) from exc
    except (APIConnectionError, APITimeoutError) as exc:
        raise APIError(
            503, "AI_SERVICE_UNAVAILABLE", "The AI demo is temporarily unavailable."
        ) from exc
    except Exception as exc:
        raise APIError(502, "AI_PROVIDER_ERROR", "The AI response could not be completed.") from exc

    content = result.choices[0].message.content if result.choices else None
    if not content:
        raise APIError(502, "INVALID_AI_RESPONSE", "The AI returned an empty response.")
    try:
        payload: Any = json.loads(content)
        return ModelReply.model_validate(payload)
    except (json.JSONDecodeError, ValueError) as exc:
        raise APIError(502, "INVALID_AI_RESPONSE", "The AI returned an invalid response.") from exc


async def transcribe_audio(
    *,
    settings: Settings,
    filename: str,
    content_type: str,
    audio: bytes,
) -> tuple[str, float | None]:
    try:
        result = await _get_client(settings).audio.transcriptions.create(
            file=(filename, audio, content_type),
            model=settings.groq_stt_model,
            language="en",
            temperature=0.0,
            response_format="verbose_json",
        )
    except RateLimitError as exc:
        raise APIError(
            429,
            "VOICE_SERVICE_BUSY",
            "The voice demo is busy. Text chat is still available.",
        ) from exc
    except (APIConnectionError, APITimeoutError) as exc:
        raise APIError(
            503,
            "VOICE_SERVICE_UNAVAILABLE",
            "The voice demo is temporarily unavailable. Text chat is still available.",
        ) from exc
    except Exception as exc:
        raise APIError(
            502, "VOICE_PROVIDER_ERROR", "The recording could not be transcribed."
        ) from exc

    transcript = str(getattr(result, "text", "") or "").strip()
    duration_value = getattr(result, "duration", None)
    try:
        duration = float(duration_value) if duration_value is not None else None
    except (TypeError, ValueError):
        duration = None
    if not transcript:
        raise APIError(422, "EMPTY_TRANSCRIPT", "No speech was detected in the recording.")
    return transcript, duration
