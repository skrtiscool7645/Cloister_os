import uuid
from typing import Optional, Annotated, Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func

from app.api.deps import get_current_user
from app.exceptions import NotFoundException
from app.models.base import get_session
from app.models.property import Unit
from app.repositories import UnitRepository

router = APIRouter(prefix="/units", tags=["units"])


@router.get("")
async def list_units(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    property_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        filters = []
        if property_id:
            filters.append(Unit.property_id == property_id)
        if status:
            filters.append(Unit.status == status)
        repo = UnitRepository(session)
        units = await repo.get_all(*filters)
        return {
            "items": [u.dict() for u in units[skip : skip + limit]],
            "total": len(units),
            "skip": skip,
            "limit": limit,
        }


@router.post("", status_code=201)
async def create_unit(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = UnitRepository(session)
        unit = await repo.create(body)
        await session.commit()
        return unit.dict()


@router.get("/{unit_id}")
async def get_unit(
    unit_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = UnitRepository(session)
        unit = await repo.get(unit_id)
        if not unit:
            raise NotFoundException("Unit", str(unit_id))
        return unit.dict()


@router.patch("/{unit_id}")
async def update_unit(
    unit_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = UnitRepository(session)
        unit = await repo.update(unit_id, body)
        if not unit:
            raise NotFoundException("Unit", str(unit_id))
        await session.commit()
        return unit.dict()


@router.delete("/{unit_id}")
async def delete_unit(
    unit_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, str]:
    async with get_session() as session:
        repo = UnitRepository(session)
        existing = await repo.get(unit_id)
        if not existing:
            raise NotFoundException("Unit", str(unit_id))
        await repo.delete(unit_id)
        await session.commit()
        return {"message": "Unit deleted"}
