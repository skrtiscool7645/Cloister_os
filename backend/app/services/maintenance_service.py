import uuid
from typing import Optional, Any

from app.models.maintenance import MaintenanceRequest


class MaintenanceService:
    def __init__(self, repo: Any) -> None:
        self.repo = repo

    async def get_requests(self, skip: int = 0, limit: int = 100, filters: Optional[dict[str, Any]] = None) -> list[MaintenanceRequest]:
        ...

    async def get_request(self, id: str) -> MaintenanceRequest:
        ...

    async def create_request(self, data: dict[str, Any]) -> MaintenanceRequest:
        ...

    async def update_request(self, id: str, data: dict[str, Any]) -> MaintenanceRequest:
        ...

    async def delete_request(self, id: str) -> None:
        ...
