import asyncio
import hashlib
import hmac
import secrets
import time
from dataclasses import dataclass

from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from upstash_redis import AsyncRedis

from app.config import Settings
from app.errors import APIError


COOKIE_NAME = "lotline_visitor_id"
_local_counts: dict[str, tuple[int, float]] = {}
_local_lock = asyncio.Lock()


@dataclass(frozen=True)
class VisitorIdentity:
    visitor_id: str
    signed_cookie: str | None


def _cookie_secret(settings: Settings) -> str:
    if settings.visitor_cookie_secret:
        return settings.visitor_cookie_secret.get_secret_value()
    if settings.is_production:
        raise APIError(503, "VOICE_LIMIT_NOT_CONFIGURED", "The voice demo is not configured.")
    return "lotline-local-development-cookie-secret"


def get_visitor_identity(raw_cookie: str | None, settings: Settings) -> VisitorIdentity:
    serializer = URLSafeTimedSerializer(_cookie_secret(settings), salt="lotline-voice-limit")
    if raw_cookie:
        try:
            visitor_id = serializer.loads(
                raw_cookie, max_age=settings.voice_limit_window_seconds
            )
            if isinstance(visitor_id, str) and 16 <= len(visitor_id) <= 128:
                return VisitorIdentity(visitor_id=visitor_id, signed_cookie=None)
        except (BadSignature, SignatureExpired):
            pass

    visitor_id = secrets.token_urlsafe(24)
    return VisitorIdentity(visitor_id=visitor_id, signed_cookie=serializer.dumps(visitor_id))


def _counter_key(visitor_id: str, settings: Settings) -> str:
    digest = hmac.new(
        _cookie_secret(settings).encode(), visitor_id.encode(), hashlib.sha256
    ).hexdigest()
    return f"voice-limit:{digest}"


async def _consume_local(key: str, settings: Settings) -> int:
    now = time.monotonic()
    async with _local_lock:
        count, expires = _local_counts.get(key, (0, now + settings.voice_limit_window_seconds))
        if now >= expires:
            count, expires = 0, now + settings.voice_limit_window_seconds
        count += 1
        _local_counts[key] = (count, expires)
        return count


async def consume_voice_turn(visitor_id: str, settings: Settings) -> int:
    key = _counter_key(visitor_id, settings)
    if settings.redis_configured:
        assert settings.upstash_redis_rest_url
        assert settings.upstash_redis_rest_token
        redis = AsyncRedis(
            url=settings.upstash_redis_rest_url,
            token=settings.upstash_redis_rest_token.get_secret_value(),
            allow_telemetry=False,
        )
        script = """
        local count = redis.call('INCR', KEYS[1])
        if count == 1 then
          redis.call('EXPIRE', KEYS[1], ARGV[1])
        end
        return count
        """
        try:
            count = int(
                await redis.eval(
                    script,
                    keys=[key],
                    args=[str(settings.voice_limit_window_seconds)],
                )
            )
        except Exception as exc:
            raise APIError(
                503, "VOICE_LIMIT_UNAVAILABLE", "The voice demo is temporarily unavailable."
            ) from exc
    elif settings.is_production:
        raise APIError(503, "VOICE_LIMIT_NOT_CONFIGURED", "The voice demo is not configured.")
    else:
        count = await _consume_local(key, settings)

    if count > settings.voice_visitor_limit:
        raise APIError(
            429,
            "VOICE_LIMIT_REACHED",
            "This browser has used both voice messages for today. Text chat is still available.",
        )
    return max(settings.voice_visitor_limit - count, 0)
