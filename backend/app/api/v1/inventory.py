import uuid
from typing import Optional, Annotated, Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text

from app.api.deps import get_current_user
from app.exceptions import NotFoundException, ValidationException
from app.models.base import get_session
from app.models.inventory import InventoryCategory, InventoryItem
from app.repositories import InventoryRepository

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("")
async def list_inventory(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        filters = []
        if category_id:
            filters.append(InventoryItem.category_id == category_id)
        repo = InventoryRepository(session)
        items = await repo.get_all(*filters)
        if search:
            items = [i for i in items if search.lower() in i.name.lower()]
        return {
            "items": [i.dict() for i in items[skip : skip + limit]],
            "total": len(items),
            "skip": skip,
            "limit": limit,
        }


@router.post("", status_code=201)
async def create_item(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = InventoryRepository(session)
        item = await repo.create(body)
        await session.commit()
        return item.dict()


@router.get("/{item_id}")
async def get_item(
    item_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = InventoryRepository(session)
        item = await repo.get(item_id)
        if not item:
            raise NotFoundException("InventoryItem", str(item_id))
        return item.dict()


@router.patch("/{item_id}")
async def update_item(
    item_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = InventoryRepository(session)
        item = await repo.update(item_id, body)
        if not item:
            raise NotFoundException("InventoryItem", str(item_id))
        await session.commit()
        return item.dict()


@router.delete("/{item_id}")
async def delete_item(
    item_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, str]:
    async with get_session() as session:
        repo = InventoryRepository(session)
        existing = await repo.get(item_id)
        if not existing:
            raise NotFoundException("InventoryItem", str(item_id))
        await repo.delete(item_id)
        await session.commit()
        return {"message": "Inventory item deleted"}


@router.get("/low-stock")
async def low_stock_alerts(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        repo = InventoryRepository(session)
        all_items = await repo.get_all()
        low_stock = [i for i in all_items if i.min_stock_level is not None and i.quantity <= i.min_stock_level]
        return {
            "items": [i.dict() for i in low_stock],
            "total": len(low_stock),
        }


@router.post("/{item_id}/adjust")
async def adjust_quantity(
    item_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = InventoryRepository(session)
        item = await repo.get(item_id)
        if not item:
            raise NotFoundException("InventoryItem", str(item_id))
        adjustment = body.get("adjustment", 0)
        new_quantity = item.quantity + adjustment
        if new_quantity < 0:
            raise ValidationException("Insufficient stock")
        updated = await repo.update(item_id, {"quantity": new_quantity})
        await session.commit()
        return updated.dict()


@router.get("/categories")
async def list_categories(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        from sqlalchemy import select
        result = await session.execute(
            select(InventoryCategory).where(InventoryCategory.deleted_at.is_(None))
        )
        categories = result.scalars().all()
        return {"items": [c.dict() for c in categories]}


@router.post("/categories", status_code=201)
async def create_category(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        category = InventoryCategory(**body)
        session.add(category)
        await session.flush()
        await session.refresh(category)
        await session.commit()
        return category.dict()
