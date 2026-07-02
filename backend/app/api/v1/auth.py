import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Request

from app.api.deps import get_auth_service, get_current_user
from app.exceptions import UnauthorizedException
from app.services.auth_service import AuthService
from app.schemas.auth import LoginRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login(
    body: LoginRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict[str, Any]:
    return await auth_service.login(email=body.email, password=body.password)


@router.post("/register")
async def register(
    body: dict[str, Any],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict[str, Any]:
    user = await auth_service.register(body)
    return user.dict()


@router.post("/refresh")
async def refresh(
    body: dict[str, str],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict[str, Any]:
    return await auth_service.refresh_access_token(body["refresh_token"])


@router.post("/logout")
async def logout(
    body: dict[str, str],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, str]:
    return {"message": "Logged out successfully"}


@router.post("/reset-password")
async def request_reset(
    body: dict[str, str],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict[str, str]:
    await auth_service.request_password_reset(body["email"])
    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password/confirm")
async def confirm_reset(
    body: dict[str, str],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict[str, str]:
    await auth_service.confirm_password_reset(body["token"], body["new_password"])
    return {"message": "Password reset successfully"}


@router.get("/me")
async def get_me(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    return current_user


@router.patch("/me")
async def update_me(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict[str, Any]:
    user_id = str(current_user["sub"])
    from app.services.user_service import UserService
    from app.dependencies import get_user_repo
    user_repo = await get_user_repo()
    user_service = UserService(user_repo)
    user = await user_service.update_user(user_id, body)
    return user.dict()
