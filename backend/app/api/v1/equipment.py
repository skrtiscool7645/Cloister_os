import uuid
from typing import Optional, Annotated, Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select

from app.api.deps import get_current_user
from app.exceptions import NotFoundException
from app.models.base import get_session
from app.models.equipment import Equipment, EquipmentCategory, EquipmentMaintenanceRecord
from app.repositories import EquipmentRepository

router = APIRouter(prefix="/equipment", tags=["equipment"])


@router.get("")
async def list_equipment(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    category_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        filters = []
        if category_id:
            filters.append(Equipment.category_id == category_id)
        if status:
            filters.append(Equipment.status == status)
        repo = EquipmentRepository(session)
        items = await repo.get_all(*filters)
        return {
            "items": [i.dict() for i in items[skip : skip + limit]],
            "total": len(items),
            "skip": skip,
            "limit": limit,
        }


@router.post("", status_code=201)
async def create_equipment(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = EquipmentRepository(session)
        item = await repo.create(body)
        await session.commit()
        return item.dict()


@router.get("/{equipment_id}")
async def get_equipment(
    equipment_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = EquipmentRepository(session)
        item = await repo.get(equipment_id)
        if not item:
            raise NotFoundException("Equipment", str(equipment_id))
        return item.dict()


@router.patch("/{equipment_id}")
async def update_equipment(
    equipment_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = EquipmentRepository(session)
        item = await repo.update(equipment_id, body)
        if not item:
            raise NotFoundException("Equipment", str(equipment_id))
        await session.commit()
        return item.dict()


@router.delete("/{equipment_id}")
async def delete_equipment(
    equipment_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, str]:
    async with get_session() as session:
        repo = EquipmentRepository(session)
        existing = await repo.get(equipment_id)
        if not existing:
            raise NotFoundException("Equipment", str(equipment_id))
        await repo.delete(equipment_id)
        await session.commit()
        return {"message": "Equipment deleted"}


@router.get("/{equipment_id}/maintenance")
async def get_equipment_maintenance(
    equipment_id: str,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        result = await session.execute(
            select(EquipmentMaintenanceRecord)
            .where(EquipmentMaintenanceRecord.equipment_id == equipment_id)
            .where(EquipmentMaintenanceRecord.deleted_at.is_(None))
            .order_by(EquipmentMaintenanceRecord.performed_at.desc())
        )
        records = result.scalars().all()
        return {
            "items": [r.dict() for r in records[skip : skip + limit]],
            "total": len(records),
        }


@router.post("/{equipment_id}/maintenance", status_code=201)
async def log_equipment_maintenance(
    equipment_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = EquipmentRepository(session)
        existing = await repo.get(equipment_id)
        if not existing:
            raise NotFoundException("Equipment", str(equipment_id))
        record = EquipmentMaintenanceRecord(equipment_id=equipment_id, **body)
        session.add(record)
        await session.flush()
        await session.refresh(record)
        await session.commit()
        return record.dict()


@router.get("/categories")
async def list_categories(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        result = await session.execute(
            select(EquipmentCategory).where(EquipmentCategory.deleted_at.is_(None))
        )
        categories = result.scalars().all()
        return {"items": [c.dict() for c in categories]}


@router.post("/categories", status_code=201)
async def create_category(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        category = EquipmentCategory(**body)
        session.add(category)
        await session.flush()
        await session.refresh(category)
        await session.commit()
        return category.dict()
