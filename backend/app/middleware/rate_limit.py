import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.config import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.requests: dict[str, list[float]] = {}

    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith(("/docs", "/redoc", "/health", "/openapi.json")):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window = 60.0

        if client_ip not in self.requests:
            self.requests[client_ip] = []

        self.requests[client_ip] = [
            t for t in self.requests[client_ip] if now - t < window
        ]

        if len(self.requests[client_ip]) >= settings.rate_limit_per_minute:
            return JSONResponse(
                status_code=429,
                content={
                    "error": {
                        "code": "RATE_LIMITED",
                        "message": "Too many requests. Please try again later.",
                    }
                },
            )

        self.requests[client_ip].append(now)
        return await call_next(request)
