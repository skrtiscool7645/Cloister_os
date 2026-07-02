import uuid
from datetime import datetime, timezone
from typing import Optional, Annotated, Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text

from app.api.deps import get_current_user
from app.exceptions import NotFoundException
from app.models.base import get_session
from app.models.maintenance import WorkOrder, WorkOrderAssignee, WorkOrderMaterial
from app.repositories import WorkOrderRepository

router = APIRouter(prefix="/work-orders", tags=["work_orders"])


@router.get("")
async def list_work_orders(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    status: Optional[str] = None,
    assigned_to: Optional[str] = None,
    property_id: Optional[str] = None,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        filters = []
        if status:
            filters.append(WorkOrder.status == status)
        if property_id:
            filters.append(WorkOrder.property_id == property_id)
        repo = WorkOrderRepository(session)
        orders = await repo.get_all(*filters)
        if assigned_to:
            from sqlalchemy import select
            stmt = (
                select(WorkOrder)
                .join(WorkOrderAssignee, WorkOrderAssignee.work_order_id == WorkOrder.id)
                .where(WorkOrder.deleted_at.is_(None))
                .where(WorkOrderAssignee.employee_id == assigned_to)
            )
            result = await session.execute(stmt)
            orders = list(result.scalars().all())
        return {
            "items": [o.dict() for o in orders[skip : skip + limit]],
            "total": len(orders),
            "skip": skip,
            "limit": limit,
        }


@router.post("", status_code=201)
async def create_work_order(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = WorkOrderRepository(session)
        order = await repo.create(body)
        await session.commit()
        return order.dict()


@router.get("/{work_order_id}")
async def get_work_order(
    work_order_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = WorkOrderRepository(session)
        order = await repo.get(work_order_id)
        if not order:
            raise NotFoundException("WorkOrder", str(work_order_id))
        return order.dict()


@router.patch("/{work_order_id}")
async def update_work_order(
    work_order_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = WorkOrderRepository(session)
        order = await repo.update(work_order_id, body)
        if not order:
            raise NotFoundException("WorkOrder", str(work_order_id))
        await session.commit()
        return order.dict()


@router.delete("/{work_order_id}")
async def delete_work_order(
    work_order_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, str]:
    async with get_session() as session:
        repo = WorkOrderRepository(session)
        existing = await repo.get(work_order_id)
        if not existing:
            raise NotFoundException("WorkOrder", str(work_order_id))
        await repo.delete(work_order_id)
        await session.commit()
        return {"message": "Work order deleted"}


@router.post("/{work_order_id}/assign")
async def assign_work_order(
    work_order_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = WorkOrderRepository(session)
        order = await repo.get(work_order_id)
        if not order:
            raise NotFoundException("WorkOrder", str(work_order_id))
        employee_ids = body.get("employee_ids", [])
        for eid in employee_ids:
            assignee = WorkOrderAssignee(work_order_id=work_order_id, employee_id=str(eid) if isinstance(eid, str) else eid)
            session.add(assignee)
        await session.flush()
        await session.commit()
        return {"message": f"Assigned {len(employee_ids)} employee(s)"}


@router.post("/{work_order_id}/start")
async def start_work_order(
    work_order_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = WorkOrderRepository(session)
        order = await repo.get(work_order_id)
        if not order:
            raise NotFoundException("WorkOrder", str(work_order_id))
        updated = await repo.update(work_order_id, {
            "status": "in_progress",
            "actual_start": datetime.now(timezone.utc),
        })
        await session.commit()
        return updated.dict()


@router.post("/{work_order_id}/complete")
async def complete_work_order(
    work_order_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = WorkOrderRepository(session)
        order = await repo.get(work_order_id)
        if not order:
            raise NotFoundException("WorkOrder", str(work_order_id))
        update_data = {
            "status": "completed",
            "actual_end": datetime.now(timezone.utc),
        }
        if "completion_notes" in body:
            update_data["completion_notes"] = body["completion_notes"]
        if "actual_hours" in body:
            update_data["actual_hours"] = body["actual_hours"]
        updated = await repo.update(work_order_id, update_data)
        await session.commit()
        return updated.dict()


@router.post("/{work_order_id}/approve")
async def approve_work_order(
    work_order_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = WorkOrderRepository(session)
        order = await repo.get(work_order_id)
        if not order:
            raise NotFoundException("WorkOrder", str(work_order_id))
        updated = await repo.update(work_order_id, {"status": "approved", "notes": body.get("notes")})
        await session.commit()
        return updated.dict()


@router.post("/{work_order_id}/photos")
async def add_work_order_photos(
    work_order_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = WorkOrderRepository(session)
        order = await repo.get(work_order_id)
        if not order:
            raise NotFoundException("WorkOrder", str(work_order_id))
        photos = body.get("photos", [])
        for photo_url in photos:
            await session.execute(
                text("INSERT INTO work_order_photos (work_order_id, photo_url) VALUES (:wo_id, :url)"),
                {"wo_id": work_order_id, "url": photo_url},
            )
        await session.commit()
        return {"message": f"Added {len(photos)} photo(s)"}


@router.post("/{work_order_id}/materials")
async def log_materials(
    work_order_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = WorkOrderRepository(session)
        order = await repo.get(work_order_id)
        if not order:
            raise NotFoundException("WorkOrder", str(work_order_id))
        materials = body.get("materials", [])
        for mat in materials:
            material = WorkOrderMaterial(
                work_order_id=work_order_id,
                inventory_item_id=mat["inventory_item_id"],
                quantity_used=mat.get("quantity_used", 0),
                unit_cost=mat.get("unit_cost"),
            )
            session.add(material)
        await session.flush()
        await session.commit()
        return {"message": f"Logged {len(materials)} material(s)"}
