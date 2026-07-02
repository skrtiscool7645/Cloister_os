from typing import Annotated, Any

from fastapi import APIRouter, Depends
from sqlalchemy import text

from app.api.deps import get_current_user
from app.models.base import get_session

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/occupancy")
async def occupancy_rates(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        result = await session.execute(
            text("""
                SELECT
                    COUNT(*) as total_units,
                    COUNT(*) FILTER (WHERE status = 'occupied') as occupied_units,
                    ROUND(
                        COUNT(*) FILTER (WHERE status = 'occupied')::decimal / NULLIF(COUNT(*), 0) * 100, 2
                    ) as occupancy_rate
                FROM units WHERE deleted_at IS NULL
            """)
        )
        row = result.mappings().first()
        return dict(row) if row else {}


@router.get("/revenue")
async def revenue_analytics(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        result = await session.execute(
            text("""
                SELECT
                    COALESCE(SUM(monthly_rent), 0) as total_potential_revenue,
                    COUNT(*) as total_active_leases,
                    COALESCE(AVG(monthly_rent), 0) as avg_rent
                FROM leases
                WHERE status = 'active' AND deleted_at IS NULL
            """)
        )
        row = result.mappings().first()
        return dict(row) if row else {}


@router.get("/maintenance")
async def maintenance_analytics(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        result = await session.execute(
            text("""
                SELECT
                    COUNT(*) as total_requests,
                    COUNT(*) FILTER (WHERE status = 'open') as open_requests,
                    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_requests,
                    COUNT(*) FILTER (WHERE status = 'completed') as completed_requests,
                    COUNT(*) FILTER (WHERE priority = 'emergency') as emergency_requests
                FROM maintenance_requests WHERE deleted_at IS NULL
            """)
        )
        row = result.mappings().first()
        return dict(row) if row else {}


@router.get("/expenses")
async def expense_analytics(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        result = await session.execute(
            text("""
                SELECT
                    COALESCE(SUM(estimated_hours), 0) as total_estimated_hours,
                    COALESCE(SUM(actual_hours), 0) as total_actual_hours,
                    COUNT(*) as total_work_orders,
                    COUNT(*) FILTER (WHERE status = 'completed') as completed_work_orders,
                    COUNT(*) FILTER (WHERE is_billable = TRUE) as billable_work_orders
                FROM work_orders WHERE deleted_at IS NULL
            """)
        )
        row = result.mappings().first()
        return dict(row) if row else {}
