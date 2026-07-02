from datetime import datetime, timedelta, timezone
from typing import Optional, Any

from jose import JWTError, jwt

from app.config import settings


class InvalidTokenError(Exception):
    pass


class JWTService:
    def create_access_token(
        self,
        user_id: str,
        email: str,
        roles: list[str],
        permissions: dict[str, Any],
        scope: Optional[dict[str, Any]] = None,
    ) -> str:
        now = datetime.now(timezone.utc)
        payload = {
            "sub": user_id,
            "email": email,
            "roles": roles,
            "permissions": permissions,
            "scope": scope or {},
            "type": "access",
            "iat": now,
            "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
        }
        return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

    def create_refresh_token(self, user_id: str, jti: str) -> str:
        now = datetime.now(timezone.utc)
        payload = {
            "sub": user_id,
            "jti": jti,
            "type": "refresh",
            "iat": now,
            "exp": now + timedelta(days=settings.refresh_token_expire_days),
        }
        return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

    def validate_access_token(self, token: str) -> dict[str, Any]:
        try:
            payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
            if payload.get("type") != "access":
                raise InvalidTokenError("Token is not an access token")
            return payload
        except JWTError as e:
            raise InvalidTokenError(str(e)) from e

    def validate_refresh_token(self, token: str) -> dict[str, Any]:
        try:
            payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
            if payload.get("type") != "refresh":
                raise InvalidTokenError("Token is not a refresh token")
            return payload
        except JWTError as e:
            raise InvalidTokenError(str(e)) from e
