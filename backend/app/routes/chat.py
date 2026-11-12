from fastapi import APIRouter, Depends, Request

from app.config import Settings, get_settings
from app.errors import APIError
from app.models.api import ChatRequest, ChatResponse
from app.services.conversation import process_turn


router = APIRouter(tags=["chat"])


@router.post("/chat/turn", response_model=ChatResponse)
async def chat_turn(
    payload: ChatRequest,
    request: Request,
    settings: Settings = Depends(get_settings),
) -> ChatResponse:
    content_type = request.headers.get("content-type", "").split(";", 1)[0].lower()
    if content_type != "application/json":
        raise APIError(415, "JSON_REQUIRED", "Text chat accepts JSON only.")
    return await process_turn(
        message=payload.message, history=payload.history, settings=settings
    )
