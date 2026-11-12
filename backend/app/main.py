from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.errors import APIError
from app.routes import chat, health, voice
from app.services.context import load_context
from app.services.voice_limits import COOKIE_NAME, get_visitor_identity


@asynccontextmanager
async def lifespan(_: FastAPI):
    load_context()
    yield


settings = get_settings()
app = FastAPI(
    title="LotLine Website Demo API",
    version="0.1.0",
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.middleware("http")
async def voice_identity_cookie(request: Request, call_next):
    identity = None
    if request.url.path.startswith("/api/voice"):
        try:
            identity = get_visitor_identity(request.cookies.get(COOKIE_NAME), settings)
            request.state.visitor_id = identity.visitor_id
        except APIError as exc:
            return JSONResponse(
                status_code=exc.status_code,
                content={"error": {"code": exc.code, "message": exc.public_message}},
            )

    response = await call_next(request)
    if identity and identity.signed_cookie:
        response.set_cookie(
            key=COOKIE_NAME,
            value=identity.signed_cookie,
            max_age=settings.voice_limit_window_seconds,
            httponly=True,
            secure=settings.is_production,
            samesite="lax",
            path="/api/voice",
        )
    return response


@app.middleware("http")
async def request_transport_limits(request: Request, call_next):
    if request.method == "POST" and request.url.path == "/api/chat/turn":
        content_type = request.headers.get("content-type", "").split(";", 1)[0].lower()
        if content_type != "application/json":
            return JSONResponse(
                status_code=415,
                content={
                    "error": {
                        "code": "JSON_REQUIRED",
                        "message": "Text chat accepts JSON only.",
                    }
                },
            )
        content_length = request.headers.get("content-length")
        if content_length and content_length.isdigit() and int(content_length) > 32_768:
            return JSONResponse(
                status_code=413,
                content={
                    "error": {
                        "code": "REQUEST_TOO_LARGE",
                        "message": "The chat request is too large.",
                    }
                },
            )
    return await call_next(request)


@app.exception_handler(APIError)
async def api_error_handler(_: Request, exc: APIError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.public_message}},
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_: Request, __: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "INVALID_REQUEST",
                "message": "The request format is invalid.",
            }
        },
    )


@app.exception_handler(Exception)
async def unexpected_error_handler(_: Request, __: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "The request could not be completed.",
            }
        },
    )


app.include_router(health.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(voice.router, prefix="/api")
