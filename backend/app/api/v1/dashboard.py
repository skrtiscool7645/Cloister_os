from typing import Annotated, Any

from fastapi import APIRouter, Depends
from sqlalchemy import text

from app.api.deps import get_current_user
from app.exceptions import NotFoundException
from app.models.base import get_session

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
async def summary(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        properties = await session.execute(
            text("SELECT COUNT(*) as total FROM properties WHERE deleted_at IS NULL")
        )
        units = await session.execute(
            text("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'occupied') as occupied FROM units WHERE deleted_at IS NULL")
        )
        tenants = await session.execute(
            text("SELECT COUNT(*) as total FROM tenants WHERE deleted_at IS NULL")
        )
        open_maintenance = await session.execute(
            text("SELECT COUNT(*) as total FROM maintenance_requests WHERE status IN ('open', 'in_progress') AND deleted_at IS NULL")
        )
        pending_work = await session.execute(
            text("SELECT COUNT(*) as total FROM work_orders WHERE status IN ('pending', 'in_progress') AND deleted_at IS NULL")
        )
        return {
            "properties": dict(properties.mappings().first() or {"total": 0}),
            "units": dict(units.mappings().first() or {"total": 0, "occupied": 0}),
            "tenants": dict(tenants.mappings().first() or {"total": 0}),
            "open_maintenance": dict(open_maintenance.mappings().first() or {"total": 0}),
            "pending_work_orders": dict(pending_work.mappings().first() or {"total": 0}),
        }


@router.get("/widgets/{widget_type}")
async def widget_data(
    widget_type: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        if widget_type == "occupancy":
            result = await session.execute(
                text("SELECT status, COUNT(*) as count FROM units WHERE deleted_at IS NULL GROUP BY status")
            )
            rows = result.mappings().all()
            return {"widget": widget_type, "data": [dict(r) for r in rows]}
        elif widget_type == "recent_leases":
            result = await session.execute(
                text("SELECT * FROM leases WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5")
            )
            rows = result.mappings().all()
            return {"widget": widget_type, "data": [dict(r) for r in rows]}
        elif widget_type == "maintenance_alerts":
            result = await session.execute(
                text("SELECT * FROM maintenance_requests WHERE status IN ('open', 'in_progress') AND priority IN ('high', 'emergency') AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 10")
            )
            rows = result.mappings().all()
            return {"widget": widget_type, "data": [dict(r) for r in rows]}
        elif widget_type == "revenue":
            result = await session.execute(
                text("SELECT COALESCE(SUM(monthly_rent), 0) as monthly_revenue, COUNT(*) as active_leases FROM leases WHERE status = 'active' AND deleted_at IS NULL")
            )
            row = result.mappings().first()
            return {"widget": widget_type, "data": dict(row) if row else {}}
        raise NotFoundException("Widget", widget_type)
