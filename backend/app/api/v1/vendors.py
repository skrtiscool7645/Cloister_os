import uuid
from typing import Optional, Annotated, Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select

from app.api.deps import get_current_user
from app.exceptions import NotFoundException
from app.models.base import get_session
from app.models.maintenance import WorkOrder
from app.models.vendor import Vendor, VendorContract
from app.repositories import VendorRepository

router = APIRouter(prefix="/vendors", tags=["vendors"])


@router.get("")
async def list_vendors(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        filters = []
        if is_active is not None:
            filters.append(Vendor.is_active == is_active)
        repo = VendorRepository(session)
        vendors = await repo.get_all(*filters)
        if search:
            vendors = [v for v in vendors if search.lower() in v.company_name.lower()]
        return {
            "items": [v.dict() for v in vendors[skip : skip + limit]],
            "total": len(vendors),
            "skip": skip,
            "limit": limit,
        }


@router.post("", status_code=201)
async def create_vendor(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = VendorRepository(session)
        vendor = await repo.create(body)
        await session.commit()
        return vendor.dict()


@router.get("/{vendor_id}")
async def get_vendor(
    vendor_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = VendorRepository(session)
        vendor = await repo.get(vendor_id)
        if not vendor:
            raise NotFoundException("Vendor", str(vendor_id))
        return vendor.dict()


@router.patch("/{vendor_id}")
async def update_vendor(
    vendor_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = VendorRepository(session)
        vendor = await repo.update(vendor_id, body)
        if not vendor:
            raise NotFoundException("Vendor", str(vendor_id))
        await session.commit()
        return vendor.dict()


@router.delete("/{vendor_id}")
async def delete_vendor(
    vendor_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, str]:
    async with get_session() as session:
        repo = VendorRepository(session)
        existing = await repo.get(vendor_id)
        if not existing:
            raise NotFoundException("Vendor", str(vendor_id))
        await repo.delete(vendor_id)
        await session.commit()
        return {"message": "Vendor deleted"}


@router.get("/{vendor_id}/contracts")
async def get_vendor_contracts(
    vendor_id: str,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        result = await session.execute(
            select(VendorContract)
            .where(VendorContract.vendor_id == vendor_id)
            .where(VendorContract.deleted_at.is_(None))
            .order_by(VendorContract.created_at.desc())
        )
        contracts = result.scalars().all()
        return {
            "items": [c.dict() for c in contracts[skip : skip + limit]],
            "total": len(contracts),
        }


@router.post("/{vendor_id}/contracts", status_code=201)
async def add_vendor_contract(
    vendor_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = VendorRepository(session)
        existing = await repo.get(vendor_id)
        if not existing:
            raise NotFoundException("Vendor", str(vendor_id))
        contract = VendorContract(vendor_id=vendor_id, **body)
        session.add(contract)
        await session.flush()
        await session.refresh(contract)
        await session.commit()
        return contract.dict()


@router.get("/{vendor_id}/work-orders")
async def get_vendor_work_orders(
    vendor_id: str,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        from sqlalchemy import text
        result = await session.execute(
            text("SELECT * FROM work_orders WHERE vendor_id = :vid AND deleted_at IS NULL ORDER BY created_at DESC"),
            {"vid": vendor_id},
        )
        rows = result.mappings().all()
        return {
            "items": [dict(r) for r in rows[skip : skip + limit]],
            "total": len(rows),
        }
