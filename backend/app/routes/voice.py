import json
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from pydantic import TypeAdapter, ValidationError

from app.config import Settings, get_settings
from app.errors import APIError
from app.models.api import HistoryTurn, VoiceResponse
from app.services.conversation import process_turn
from app.services.groq_client import transcribe_audio
from app.services.voice_limits import consume_voice_turn


router = APIRouter(tags=["voice"])
HISTORY_ADAPTER = TypeAdapter(list[HistoryTurn])
ALLOWED_AUDIO_TYPES = {
    "audio/webm": ("recording.webm", b"\x1aE\xdf\xa3"),
    "audio/ogg": ("recording.ogg", b"OggS"),
    "audio/wav": ("recording.wav", b"RIFF"),
    "audio/x-wav": ("recording.wav", b"RIFF"),
    "audio/mpeg": ("recording.mp3", None),
}


def _parse_history(raw: str, settings: Settings) -> list[HistoryTurn]:
    if len(raw) > settings.max_history_characters * 2:
        raise APIError(413, "HISTORY_TOO_LONG", "Conversation history is too long.")
    try:
        parsed = json.loads(raw or "[]")
        return HISTORY_ADAPTER.validate_python(parsed)
    except (json.JSONDecodeError, ValidationError) as exc:
        raise APIError(422, "INVALID_HISTORY", "Conversation history is invalid.") from exc


def _validate_signature(content_type: str, data: bytes, signature: bytes | None) -> None:
    if signature and not data.startswith(signature):
        raise APIError(415, "INVALID_AUDIO", "The uploaded audio format is invalid.")
    if content_type in {"audio/wav", "audio/x-wav"} and data[8:12] != b"WAVE":
        raise APIError(415, "INVALID_AUDIO", "The uploaded audio format is invalid.")
    if content_type == "audio/mpeg" and not (
        data.startswith(b"ID3") or data[:2] in {b"\xff\xfb", b"\xff\xf3", b"\xff\xf2"}
    ):
        raise APIError(415, "INVALID_AUDIO", "The uploaded audio format is invalid.")


@router.post("/voice/turn", response_model=VoiceResponse)
async def voice_turn(
    request: Request,
    session_id: Annotated[str, Form(min_length=1, max_length=128)],
    recorded_duration_ms: Annotated[int, Form(gt=0)],
    history_json: Annotated[str, Form()] = "[]",
    audio: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
) -> VoiceResponse:
    del session_id  # validated correlation value; conversation state remains stateless
    if recorded_duration_ms > settings.max_audio_seconds * 1_000:
        raise APIError(
            413, "VOICE_DURATION_EXCEEDED", "Voice messages must be 20 seconds or shorter."
        )

    content_type = (audio.content_type or "").split(";", 1)[0].lower()
    if content_type not in ALLOWED_AUDIO_TYPES:
        raise APIError(415, "UNSUPPORTED_AUDIO_TYPE", "Use WebM, OGG, WAV, or MP3 audio.")

    data = await audio.read(settings.max_audio_bytes + 1)
    await audio.close()
    if not data:
        raise APIError(422, "EMPTY_AUDIO", "The recording is empty.")
    if len(data) > settings.max_audio_bytes:
        raise APIError(413, "AUDIO_TOO_LARGE", "The recording is too large.")

    filename, signature = ALLOWED_AUDIO_TYPES[content_type]
    _validate_signature(content_type, data, signature)
    history = _parse_history(history_json, settings)

    visitor_id = getattr(request.state, "visitor_id", None)
    if not visitor_id:
        raise APIError(503, "VOICE_IDENTITY_UNAVAILABLE", "The voice demo is unavailable.")
    remaining = await consume_voice_turn(visitor_id, settings)

    transcript, actual_duration = await transcribe_audio(
        settings=settings,
        filename=filename,
        content_type=content_type,
        audio=data,
    )
    if actual_duration is not None and actual_duration > settings.max_audio_seconds + 0.25:
        raise APIError(
            413, "VOICE_DURATION_EXCEEDED", "Voice messages must be 20 seconds or shorter."
        )

    chat = await process_turn(message=transcript, history=history, settings=settings)
    return VoiceResponse(
        **chat.model_dump(),
        transcript=transcript,
        voice_turns_remaining=remaining,
    )
