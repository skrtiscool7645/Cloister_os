import uuid
from typing import Optional, Any

from app.exceptions import NotFoundException
from app.models.property import Property
from app.repositories.property_repository import PropertyRepository


class PropertyService:
    def __init__(self, property_repo: PropertyRepository) -> None:
        self.property_repo = property_repo

    async def get_properties(
        self, skip: int = 0, limit: int = 100, filters: Optional[dict[str, Any]] = None
    ) -> list[Property]:
        return await self.property_repo.list(skip=skip, limit=limit, filters=filters)

    async def get_property(self, id: str) -> Property:
        prop = await self.property_repo.get_by_id(id)
        if not prop:
            raise NotFoundException("Property", str(id))
        return prop

    async def create_property(self, data: dict[str, Any]) -> Property:
        return await self.property_repo.create(data)

    async def update_property(self, id: str, data: dict[str, Any]) -> Property:
        prop = await self.property_repo.get_by_id(id)
        if not prop:
            raise NotFoundException("Property", str(id))
        return await self.property_repo.update(id, data)

    async def delete_property(self, id: str) -> None:
        prop = await self.property_repo.get_by_id(id)
        if not prop:
            raise NotFoundException("Property", str(id))
        await self.property_repo.soft_delete(id)

    async def get_property_stats(self, property_id: str) -> dict[str, Any]:
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Property", str(property_id))
        units = prop.units or []
        total_units = len(units)
        occupied_units = sum(1 for u in units if u.status == "occupied")
        vacancy_rate = round((1 - occupied_units / total_units) * 100, 2) if total_units else 0.0
        active_leases = sum(
            1 for u in units if any(
                l.status == "active" for l in (getattr(u, "leases", None) or [])
            )
        )
        return {
            "total_units": total_units,
            "occupied_units": occupied_units,
            "vacant_units": total_units - occupied_units,
            "occupancy_rate": round(occupied_units / total_units * 100, 2) if total_units else 0.0,
            "vacancy_rate": vacancy_rate,
            "active_leases": active_leases,
            "open_requests": 0,
            "open_work_orders": 0,
        }

    async def get_property_units(
        self, property_id: str, skip: int = 0, limit: int = 100
    ) -> list[Any]:
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Property", str(property_id))
        return (prop.units or [])[skip : skip + limit]

    async def get_property_tenants(
        self, property_id: str, skip: int = 0, limit: int = 100
    ) -> list[Any]:
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Property", str(property_id))
        return (prop.tenants or [])[skip : skip + limit]

    async def get_property_documents(
        self, property_id: str, skip: int = 0, limit: int = 100
    ) -> list[Any]:
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Property", str(property_id))
        return (prop.documents or [])[skip : skip + limit]
