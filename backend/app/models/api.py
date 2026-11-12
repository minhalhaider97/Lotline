from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class HistoryTurn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2_000)


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    session_id: str = Field(min_length=1, max_length=128)
    message: str = Field(min_length=1, max_length=4_000)
    history: list[HistoryTurn] = Field(default_factory=list)


class VisitResult(BaseModel):
    status: Literal["needs_vehicle", "needs_datetime", "illustrative_confirmed"]
    vehicle_id: str | None = None
    resolved_local_time: datetime | None = None
    timezone: str = "America/Los_Angeles"


class ChatResponse(BaseModel):
    message_id: str
    assistant_text: str
    vehicles: list[str] = Field(default_factory=list)
    visit: VisitResult | None = None
    suggestions: list[str] = Field(default_factory=list)


class VoiceResponse(ChatResponse):
    transcript: str
    voice_turns_remaining: int = Field(ge=0)


class ModelReply(BaseModel):
    model_config = ConfigDict(extra="forbid")

    reply: str = Field(min_length=1, max_length=1_500)
    vehicle_ids: list[str] = Field(default_factory=list, max_length=3)
    visit_status: Literal[
        "none", "needs_vehicle", "needs_datetime", "illustrative_confirmed"
    ] = "none"
    resolved_local_time: datetime | None = None
    suggestions: list[str] = Field(default_factory=list, max_length=3)

    @field_validator("vehicle_ids")
    @classmethod
    def unique_vehicle_ids(cls, values: list[str]) -> list[str]:
        return list(dict.fromkeys(values))


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    environment: str
    groq_configured: bool
    inventory_loaded: bool
    inventory_count: int
    redis_configured: bool
    voice_limits_shared: bool
    visitor_cookie_configured: bool


class ErrorBody(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorBody
