import uuid
from typing import Optional, Any

from app.models.property import Lease


class LeaseService:
    def __init__(self, repo: Any) -> None:
        self.repo = repo

    async def get_leases(self, skip: int = 0, limit: int = 100, filters: Optional[dict[str, Any]] = None) -> list[Lease]:
        ...

    async def get_lease(self, id: str) -> Lease:
        ...

    async def create_lease(self, data: dict[str, Any]) -> Lease:
        ...

    async def update_lease(self, id: str, data: dict[str, Any]) -> Lease:
        ...

    async def delete_lease(self, id: str) -> None:
        ...
