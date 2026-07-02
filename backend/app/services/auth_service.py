import uuid
from typing import Any

from app.core.auth.jwt_service import JWTService
from app.core.auth.password_service import PasswordService
from app.core.auth.jwt_service import InvalidTokenError
from app.exceptions import (
    ConflictException,
    NotFoundException,
    UnauthorizedException,
    ValidationException,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.config import settings
from datetime import datetime, timezone


class AuthService:
    def __init__(self, user_repo: UserRepository, jwt_service: JWTService) -> None:
        self.user_repo = user_repo
        self.jwt_service = jwt_service
        self.password_service = PasswordService()

    async def login(self, email: str, password: str) -> dict[str, Any]:
        user = await self.user_repo.get_by_email(email)
        if not user:
            raise UnauthorizedException("Invalid email or password")
        if not self.password_service.verify_password(password, user.password_hash):
            raise UnauthorizedException("Invalid email or password")
        if not user.is_active:
            raise UnauthorizedException("Account is disabled")
        permissions = self._build_permissions(user)
        access_token = self.jwt_service.create_access_token(
            user_id=str(user.id),
            email=user.email,
            roles=[r.role.name for r in user.roles],
            permissions=permissions,
        )
        refresh_token = self.jwt_service.create_refresh_token(
            user_id=str(user.id), jti=str(uuid.uuid4())
        )
        await self.user_repo.update(user.id, {"last_login_at": None})
        now = datetime.now(timezone.utc)
        # Build a safe user payload for responses
        try:
            user_dict = user.dict()
        except Exception:
            # fallback for lightweight user objects
            user_dict = {
                "id": str(user.id),
                "email": getattr(user, "email", ""),
                "first_name": getattr(user, "first_name", ""),
                "last_name": getattr(user, "last_name", ""),
            }
        user_dict.setdefault("full_name", f"{user_dict.get('first_name','')} {user_dict.get('last_name','')}")
        user_dict.setdefault("roles", [r.role.name for r in getattr(user, "roles", [])])
        user_dict.setdefault("created_at", now.isoformat())
        user_dict.setdefault("updated_at", now.isoformat())

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in": settings.access_token_expire_minutes * 60,
            "user": user_dict,
        }

    async def register(self, user_data: dict[str, Any]) -> User:
        existing = await self.user_repo.get_by_email(user_data["email"])
        if existing:
            raise ConflictException("Email already registered")
        user_data["password_hash"] = self.password_service.hash_password(
            user_data.pop("password")
        )
        return await self.user_repo.create(user_data)

    async def refresh_access_token(self, refresh_token: str) -> dict[str, str]:
        try:
            payload = self.jwt_service.validate_refresh_token(refresh_token)
        except InvalidTokenError:
            raise UnauthorizedException("Invalid or expired refresh token")
        user = await self.user_repo.get_by_id(str(payload["sub"]))
        if not user or not user.is_active:
            raise UnauthorizedException("User not found or inactive")
        permissions = self._build_permissions(user)
        access_token = self.jwt_service.create_access_token(
            user_id=str(user.id),
            email=user.email,
            roles=[r.role.name for r in user.roles],
            permissions=permissions,
        )
        return {"access_token": access_token}

    def validate_access_token(self, token: str) -> dict[str, Any]:
        try:
            return self.jwt_service.validate_access_token(token)
        except InvalidTokenError:
            raise UnauthorizedException("Invalid or expired access token")

    async def change_password(
        self, user_id: str, current_password: str, new_password: str
    ) -> None:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("User", str(user_id))
        if not self.password_service.verify_password(current_password, user.password_hash):
            raise ValidationException("Current password is incorrect")
        if len(new_password) < 8:
            raise ValidationException("New password must be at least 8 characters")
        await self.user_repo.update(
            user_id, {"password_hash": self.password_service.hash_password(new_password)}
        )

    async def request_password_reset(self, email: str) -> None:
        user = await self.user_repo.get_by_email(email)
        if not user:
            return
        token = self.password_service.generate_reset_token()
        await self.user_repo.update(
            user.id,
            {
                "password_reset_token": token,
                "password_reset_expires": None,
            },
        )

    async def confirm_password_reset(self, token: str, new_password: str) -> None:
        user = await self.user_repo.get_by_reset_token(token)
        if not user:
            raise ValidationException("Invalid or expired reset token")
        if len(new_password) < 8:
            raise ValidationException("Password must be at least 8 characters")
        await self.user_repo.update(
            user.id,
            {
                "password_hash": self.password_service.hash_password(new_password),
                "password_reset_token": None,
                "password_reset_expires": None,
            },
        )

    def _build_permissions(self, user: User) -> dict[str, Any]:
        permissions: dict[str, Any] = {}
        for ur in user.roles:
            role_perms = ur.role.permissions if hasattr(ur.role, "permissions") else {}
            for module, actions in role_perms.items():
                if module not in permissions:
                    permissions[module] = {}
                for action, allowed in actions.items():
                    permissions[module][action] = permissions[module].get(action, False) or allowed
        return permissions
