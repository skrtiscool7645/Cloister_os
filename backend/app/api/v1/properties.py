import uuid
from typing import Optional, Annotated, Any

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user
from app.dependencies import get_property_repo, get_user_repo
from app.services.property_service import PropertyService

router = APIRouter(prefix="/properties", tags=["properties"])


def get_property_service() -> PropertyService:
    from app.dependencies import get_db
    import asyncio
    raise NotImplementedError("Use dependency injection")


async def _get_property_service() -> PropertyService:
    db_gen = get_property_repo()
    repo = await anext(db_gen)
    return PropertyService(repo)


@router.get("")
async def list_properties(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    status: Optional[str] = None,
    property_type: Optional[str] = None,
    search: Optional[str] = None,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    from app.dependencies import get_db
    from app.repositories import PropertyRepository
    from app.models.base import get_session
    async with get_session() as session:
        repo = PropertyRepository(session)
        service = PropertyService(repo)
        filters = {}
        if status:
            filters["status"] = status
        if property_type:
            filters["property_type"] = property_type
        if search:
            filters["search"] = search
        properties = await service.get_properties(skip=skip, limit=limit, filters=filters or None)
        return {"items": [p.dict() for p in properties], "total": len(properties), "skip": skip, "limit": limit}


@router.post("")
async def create_property(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    from app.dependencies import get_db
    from app.repositories import PropertyRepository
    from app.models.base import get_session
    async with get_session() as session:
        repo = PropertyRepository(session)
        service = PropertyService(repo)
        prop = await service.create_property(body)
        return prop.dict()


@router.get("/{property_id}")
async def get_property(
    property_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    from app.dependencies import get_db
    from app.repositories import PropertyRepository
    from app.models.base import get_session
    async with get_session() as session:
        repo = PropertyRepository(session)
        service = PropertyService(repo)
        prop = await service.get_property(property_id)
        return prop.dict()


@router.patch("/{property_id}")
async def update_property(
    property_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    from app.dependencies import get_db
    from app.repositories import PropertyRepository
    from app.models.base import get_session
    async with get_session() as session:
        repo = PropertyRepository(session)
        service = PropertyService(repo)
        prop = await service.update_property(property_id, body)
        return prop.dict()


@router.delete("/{property_id}")
async def delete_property(
    property_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, str]:
    from app.dependencies import get_db
    from app.repositories import PropertyRepository
    from app.models.base import get_session
    async with get_session() as session:
        repo = PropertyRepository(session)
        service = PropertyService(repo)
        await service.delete_property(property_id)
        return {"message": "Property deleted"}


@router.get("/{property_id}/stats")
async def get_property_stats(
    property_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    from app.dependencies import get_db
    from app.repositories import PropertyRepository
    from app.models.base import get_session
    async with get_session() as session:
        repo = PropertyRepository(session)
        service = PropertyService(repo)
        return await service.get_property_stats(property_id)


@router.get("/{property_id}/units")
async def get_property_units(
    property_id: str,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    from app.dependencies import get_db
    from app.repositories import PropertyRepository
    from app.models.base import get_session
    async with get_session() as session:
        repo = PropertyRepository(session)
        service = PropertyService(repo)
        units = await service.get_property_units(property_id, skip=skip, limit=limit)
        return {"items": [u.dict() for u in units], "total": len(units)}


@router.get("/{property_id}/tenants")
async def get_property_tenants(
    property_id: str,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    from app.dependencies import get_db
    from app.repositories import PropertyRepository
    from app.models.base import get_session
    async with get_session() as session:
        repo = PropertyRepository(session)
        service = PropertyService(repo)
        tenants = await service.get_property_tenants(property_id, skip=skip, limit=limit)
        return {"items": [t.dict() for t in tenants], "total": len(tenants)}


@router.get("/{property_id}/documents")
async def get_property_documents(
    property_id: str,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    from app.dependencies import get_db
    from app.repositories import PropertyRepository
    from app.models.base import get_session
    async with get_session() as session:
        repo = PropertyRepository(session)
        service = PropertyService(repo)
        docs = await service.get_property_documents(property_id, skip=skip, limit=limit)
        return {"items": [d.dict() for d in docs], "total": len(docs)}
