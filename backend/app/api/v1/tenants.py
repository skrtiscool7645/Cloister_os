import uuid
from typing import Optional, Annotated, Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_

from app.api.deps import get_current_user
from app.exceptions import NotFoundException
from app.models.base import get_session
from app.models.tenant import Tenant
from app.repositories import TenantRepository
from app.repositories.lease_repository import LeaseRepository
from app.repositories.maintenance_request_repository import MaintenanceRequestRepository

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.get("")
async def list_tenants(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    search: Optional[str] = None,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        repo = TenantRepository(session)
        if search:
            from sqlalchemy import select
            stmt = (
                select(Tenant)
                .where(Tenant.deleted_at.is_(None))
                .where(
                    or_(
                        Tenant.first_name.ilike(f"%{search}%"),
                        Tenant.last_name.ilike(f"%{search}%"),
                        Tenant.email.ilike(f"%{search}%"),
                    )
                )
            )
            result = await session.execute(stmt)
            tenants = list(result.scalars().all())
        else:
            tenants = await repo.get_all()
        return {
            "items": [t.dict() for t in tenants[skip : skip + limit]],
            "total": len(tenants),
            "skip": skip,
            "limit": limit,
        }


@router.post("", status_code=201)
async def create_tenant(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = TenantRepository(session)
        tenant = await repo.create(body)
        await session.commit()
        return tenant.dict()


@router.get("/{tenant_id}")
async def get_tenant(
    tenant_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = TenantRepository(session)
        tenant = await repo.get(tenant_id)
        if not tenant:
            raise NotFoundException("Tenant", str(tenant_id))
        return tenant.dict()


@router.patch("/{tenant_id}")
async def update_tenant(
    tenant_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = TenantRepository(session)
        tenant = await repo.update(tenant_id, body)
        if not tenant:
            raise NotFoundException("Tenant", str(tenant_id))
        await session.commit()
        return tenant.dict()


@router.delete("/{tenant_id}")
async def delete_tenant(
    tenant_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, str]:
    async with get_session() as session:
        repo = TenantRepository(session)
        existing = await repo.get(tenant_id)
        if not existing:
            raise NotFoundException("Tenant", str(tenant_id))
        await repo.delete(tenant_id)
        await session.commit()
        return {"message": "Tenant deleted"}


@router.get("/{tenant_id}/leases")
async def get_tenant_leases(
    tenant_id: str,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        from app.models.property import Lease
        repo = LeaseRepository(session)
        leases = await repo.get_all(Lease.tenant_id == tenant_id)
        return {
            "items": [l.dict() for l in leases[skip : skip + limit]],
            "total": len(leases),
        }


@router.get("/{tenant_id}/payments")
async def get_tenant_payments(
    tenant_id: str,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        from sqlalchemy import text
        result = await session.execute(
            text("SELECT * FROM payments WHERE tenant_id = :tenant_id AND deleted_at IS NULL ORDER BY created_at DESC"),
            {"tenant_id": tenant_id},
        )
        rows = result.mappings().all()
        return {
            "items": [dict(r) for r in rows[skip : skip + limit]],
            "total": len(rows),
        }


@router.get("/{tenant_id}/maintenance")
async def get_tenant_maintenance(
    tenant_id: str,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        repo = MaintenanceRequestRepository(session)
        from app.models.maintenance import MaintenanceRequest
        requests = await repo.get_all(MaintenanceRequest.tenant_id == tenant_id)
        return {
            "items": [r.dict() for r in requests[skip : skip + limit]],
            "total": len(requests),
        }
