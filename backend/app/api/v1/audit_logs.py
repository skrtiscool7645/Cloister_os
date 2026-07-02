import uuid
from typing import Optional, Annotated, Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text

from app.api.deps import get_current_user
from app.exceptions import NotFoundException
from app.models.base import get_session

router = APIRouter(prefix="/audit-logs", tags=["audit_logs"])


@router.get("")
async def list_audit_logs(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    entity_type: Optional[str] = None,
    action: Optional[str] = None,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        query = "SELECT * FROM audit_logs WHERE 1=1"
        params: dict[str, Any] = {}
        if entity_type:
            query += " AND entity_type = :entity_type"
            params["entity_type"] = entity_type
        if action:
            query += " AND action = :action"
            params["action"] = action
        query += " ORDER BY created_at DESC"
        result = await session.execute(text(query), params)
        rows = result.mappings().all()
        return {
            "items": [dict(r) for r in rows[skip : skip + limit]],
            "total": len(rows),
            "skip": skip,
            "limit": limit,
        }


@router.get("/{log_id}")
async def get_audit_log(
    log_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        result = await session.execute(
            text("SELECT * FROM audit_logs WHERE id = :lid"),
            {"lid": log_id},
        )
        row = result.mappings().first()
        if not row:
            raise NotFoundException("AuditLog", str(log_id))
        return dict(row)


@router.get("/export")
async def export_audit_logs(
    format: str = "json",
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        result = await session.execute(
            text("SELECT * FROM audit_logs ORDER BY created_at DESC")
        )
        rows = result.mappings().all()
        return {"items": [dict(r) for r in rows], "format": format}
