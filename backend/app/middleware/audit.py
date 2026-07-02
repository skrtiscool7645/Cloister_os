import uuid
from time import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time()
        request.state.request_id = str(uuid.uuid4())
        response = await call_next(request)
        elapsed = time() - start
        response.headers["X-Request-ID"] = request.state.request_id
        response.headers["X-Response-Time-Ms"] = str(round(elapsed * 1000))
        return response
