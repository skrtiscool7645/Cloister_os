import uuid
from typing import Optional, Annotated, Any

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user
from app.exceptions import NotFoundException
from app.models.base import get_session
from app.models.maintenance import MaintenanceRequest
from app.repositories import MaintenanceRequestRepository

router = APIRouter(prefix="/maintenance-requests", tags=["maintenance"])


@router.get("")
async def list_requests(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    property_id: Optional[str] = None,
    unit_id: Optional[str] = None,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        filters = []
        if status:
            filters.append(MaintenanceRequest.status == status)
        if priority:
            filters.append(MaintenanceRequest.priority == priority)
        if property_id:
            filters.append(MaintenanceRequest.property_id == property_id)
        if unit_id:
            filters.append(MaintenanceRequest.unit_id == unit_id)
        repo = MaintenanceRequestRepository(session)
        requests = await repo.get_all(*filters)
        return {
            "items": [r.dict() for r in requests[skip : skip + limit]],
            "total": len(requests),
            "skip": skip,
            "limit": limit,
        }


@router.post("", status_code=201)
async def create_request(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = MaintenanceRequestRepository(session)
        req = await repo.create(body)
        await session.commit()
        return req.dict()


@router.get("/{request_id}")
async def get_request(
    request_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = MaintenanceRequestRepository(session)
        req = await repo.get(request_id)
        if not req:
            raise NotFoundException("MaintenanceRequest", str(request_id))
        return req.dict()


@router.patch("/{request_id}")
async def update_request(
    request_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = MaintenanceRequestRepository(session)
        req = await repo.update(request_id, body)
        if not req:
            raise NotFoundException("MaintenanceRequest", str(request_id))
        await session.commit()
        return req.dict()


@router.delete("/{request_id}")
async def delete_request(
    request_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, str]:
    async with get_session() as session:
        repo = MaintenanceRequestRepository(session)
        existing = await repo.get(request_id)
        if not existing:
            raise NotFoundException("MaintenanceRequest", str(request_id))
        await repo.delete(request_id)
        await session.commit()
        return {"message": "Maintenance request deleted"}


@router.post("/{request_id}/assign")
async def assign_request(
    request_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = MaintenanceRequestRepository(session)
        req = await repo.get(request_id)
        if not req:
            raise NotFoundException("MaintenanceRequest", str(request_id))
        updated = await repo.update(request_id, {"assigned_to": body.get("assigned_to")})
        await session.commit()
        return updated.dict()


@router.post("/{request_id}/priority")
async def update_request_priority(
    request_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = MaintenanceRequestRepository(session)
        req = await repo.get(request_id)
        if not req:
            raise NotFoundException("MaintenanceRequest", str(request_id))
        if "priority" not in body:
            from app.exceptions import ValidationException
            raise ValidationException("priority field is required")
        updated = await repo.update(request_id, {"priority": body["priority"]})
        await session.commit()
        return updated.dict()
