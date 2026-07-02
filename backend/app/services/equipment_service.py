import uuid
from typing import Optional, Any

from app.models.equipment import Equipment


class EquipmentService:
    def __init__(self, repo: Any) -> None:
        self.repo = repo

    async def get_equipment_list(self, skip: int = 0, limit: int = 100, filters: Optional[dict[str, Any]] = None) -> list[Equipment]:
        ...

    async def get_equipment(self, id: str) -> Equipment:
        ...

    async def create_equipment(self, data: dict[str, Any]) -> Equipment:
        ...

    async def update_equipment(self, id: str, data: dict[str, Any]) -> Equipment:
        ...

    async def delete_equipment(self, id: str) -> None:
        ...
