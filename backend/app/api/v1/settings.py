from typing import Annotated, Any

from fastapi import APIRouter, Depends
from sqlalchemy import text

from app.api.deps import get_current_user
from app.models.base import get_session

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("")
async def get_settings(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        result = await session.execute(
            text("SELECT * FROM company_settings ORDER BY key")
        )
        rows = result.mappings().all()
        settings_dict = {r["key"]: r["value"] for r in rows}
        return {"settings": settings_dict}


@router.patch("")
async def update_settings(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        for key, value in body.items():
            await session.execute(
                text(
                    "INSERT INTO company_settings (key, value, created_at, updated_at) "
                    "VALUES (:key, :val, NOW(), NOW()) "
                    "ON CONFLICT (key) DO UPDATE SET value = :val, updated_at = NOW()"
                ),
                {"key": key, "val": value},
            )
        await session.commit()
        result = await session.execute(
            text("SELECT * FROM company_settings ORDER BY key")
        )
        rows = result.mappings().all()
        settings_dict = {r["key"]: r["value"] for r in rows}
        return {"settings": settings_dict}


@router.get("/company")
async def get_company_settings(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        result = await session.execute(
            text("SELECT * FROM company_settings WHERE key LIKE 'company.%' ORDER BY key")
        )
        rows = result.mappings().all()
        settings_dict = {r["key"].replace("company.", ""): r["value"] for r in rows}
        return settings_dict


@router.patch("/company")
async def update_company_settings(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        for key, value in body.items():
            prefixed_key = f"company.{key}"
            await session.execute(
                text(
                    "INSERT INTO company_settings (key, value, created_at, updated_at) "
                    "VALUES (:key, :val, NOW(), NOW()) "
                    "ON CONFLICT (key) DO UPDATE SET value = :val, updated_at = NOW()"
                ),
                {"key": prefixed_key, "val": value},
            )
        await session.commit()
        result = await session.execute(
            text("SELECT * FROM company_settings WHERE key LIKE 'company.%' ORDER BY key")
        )
        rows = result.mappings().all()
        settings_dict = {r["key"].replace("company.", ""): r["value"] for r in rows}
        return settings_dict
