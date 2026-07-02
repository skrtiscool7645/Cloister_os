import uuid
from typing import Optional, Any

from app.models.inventory import InventoryItem


class InventoryService:
    def __init__(self, repo: Any) -> None:
        self.repo = repo

    async def get_items(self, skip: int = 0, limit: int = 100, filters: Optional[dict[str, Any]] = None) -> list[InventoryItem]:
        ...

    async def get_item(self, id: str) -> InventoryItem:
        ...

    async def create_item(self, data: dict[str, Any]) -> InventoryItem:
        ...

    async def update_item(self, id: str, data: dict[str, Any]) -> InventoryItem:
        ...

    async def delete_item(self, id: str) -> None:
        ...
