from fastapi import APIRouter, Depends

from app.config import Settings, get_settings
from app.models.api import HealthResponse
from app.services.context import load_context


router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    inventory = load_context().inventory
    voice_shared = settings.redis_configured
    cookie_configured = bool(settings.visitor_cookie_secret)
    ready = settings.groq_configured and (
        not settings.is_production or voice_shared and cookie_configured
    )
    return HealthResponse(
        status="ok" if ready else "degraded",
        environment=settings.app_env,
        groq_configured=settings.groq_configured,
        inventory_loaded=True,
        inventory_count=len(inventory.vehicles),
        redis_configured=settings.redis_configured,
        voice_limits_shared=voice_shared,
        visitor_cookie_configured=cookie_configured,
    )
