from typing import Annotated, Any

from fastapi import APIRouter, Depends
from sqlalchemy import text

from app.api.deps import get_current_user
from app.models.base import get_session

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
async def system_stats(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        stats = {}
        for table in ["users", "properties", "units", "tenants", "leases", "maintenance_requests", "work_orders"]:
            result = await session.execute(
                text(f"SELECT COUNT(*) as count FROM {table} WHERE deleted_at IS NULL")
            )
            row = result.mappings().first()
            stats[table] = row["count"] if row else 0
        return stats


@router.get("/system-logs")
async def system_logs(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        result = await session.execute(
            text("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100")
        )
        rows = result.mappings().all()
        return {"items": [dict(r) for r in rows]}


@router.patch("/settings")
async def update_system_settings(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, str]:
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
        return {"message": "System settings updated"}
