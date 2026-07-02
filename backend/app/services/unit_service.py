import uuid
from typing import Optional, Any

from app.models.property import Unit


class UnitService:
    def __init__(self, repo: Any) -> None:
        self.repo = repo

    async def get_units(self, skip: int = 0, limit: int = 100, filters: Optional[dict[str, Any]] = None) -> list[Unit]:
        ...

    async def get_unit(self, id: str) -> Unit:
        ...

    async def create_unit(self, data: dict[str, Any]) -> Unit:
        ...

    async def update_unit(self, id: str, data: dict[str, Any]) -> Unit:
        ...

    async def delete_unit(self, id: str) -> None:
        ...
