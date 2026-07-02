import uuid
from datetime import datetime, timezone
from typing import Optional, Annotated, Any

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user
from app.exceptions import NotFoundException
from app.models.base import get_session
from app.models.property import Lease
from app.repositories import LeaseRepository

router = APIRouter(prefix="/leases", tags=["leases"])


@router.get("")
async def list_leases(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    status: Optional[str] = None,
    tenant_id: Optional[str] = None,
    unit_id: Optional[str] = None,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        filters = []
        if status:
            filters.append(Lease.status == status)
        if tenant_id:
            filters.append(Lease.tenant_id == tenant_id)
        if unit_id:
            filters.append(Lease.unit_id == unit_id)
        repo = LeaseRepository(session)
        leases = await repo.get_all(*filters)
        return {
            "items": [l.dict() for l in leases[skip : skip + limit]],
            "total": len(leases),
            "skip": skip,
            "limit": limit,
        }


@router.post("", status_code=201)
async def create_lease(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = LeaseRepository(session)
        lease = await repo.create(body)
        await session.commit()
        return lease.dict()


@router.get("/{lease_id}")
async def get_lease(
    lease_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = LeaseRepository(session)
        lease = await repo.get(lease_id)
        if not lease:
            raise NotFoundException("Lease", str(lease_id))
        return lease.dict()


@router.patch("/{lease_id}")
async def update_lease(
    lease_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = LeaseRepository(session)
        lease = await repo.update(lease_id, body)
        if not lease:
            raise NotFoundException("Lease", str(lease_id))
        await session.commit()
        return lease.dict()


@router.delete("/{lease_id}")
async def delete_lease(
    lease_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, str]:
    async with get_session() as session:
        repo = LeaseRepository(session)
        existing = await repo.get(lease_id)
        if not existing:
            raise NotFoundException("Lease", str(lease_id))
        await repo.delete(lease_id)
        await session.commit()
        return {"message": "Lease deleted"}


@router.post("/{lease_id}/renew")
async def renew_lease(
    lease_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = LeaseRepository(session)
        lease = await repo.get(lease_id)
        if not lease:
            raise NotFoundException("Lease", str(lease_id))
        new_end_date = body.get("end_date", lease.end_date)
        new_rent = body.get("monthly_rent", lease.monthly_rent)
        update_data = {
            "status": "active",
            "start_date": lease.end_date,
            "end_date": new_end_date,
            "monthly_rent": new_rent,
        }
        updated = await repo.update(lease_id, update_data)
        await session.commit()
        return updated.dict()


@router.post("/{lease_id}/terminate")
async def terminate_lease(
    lease_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = LeaseRepository(session)
        lease = await repo.get(lease_id)
        if not lease:
            raise NotFoundException("Lease", str(lease_id))
        update_data = {
            "status": "terminated",
            "terminated_at": datetime.now(timezone.utc),
            "termination_reason": body.get("reason"),
        }
        updated = await repo.update(lease_id, update_data)
        await session.commit()
        return updated.dict()
