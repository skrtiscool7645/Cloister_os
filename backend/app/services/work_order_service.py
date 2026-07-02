import uuid
from typing import Optional, Any

from app.models.maintenance import WorkOrder


class WorkOrderService:
    def __init__(self, repo: Any) -> None:
        self.repo = repo

    async def get_work_orders(self, skip: int = 0, limit: int = 100, filters: Optional[dict[str, Any]] = None) -> list[WorkOrder]:
        ...

    async def get_work_order(self, id: str) -> WorkOrder:
        ...

    async def create_work_order(self, data: dict[str, Any]) -> WorkOrder:
        ...

    async def update_work_order(self, id: str, data: dict[str, Any]) -> WorkOrder:
        ...

    async def delete_work_order(self, id: str) -> None:
        ...
