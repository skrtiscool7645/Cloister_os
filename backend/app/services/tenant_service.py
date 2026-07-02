import uuid
from typing import Optional, Any

from app.models.tenant import Tenant


class TenantService:
    def __init__(self, repo: Any) -> None:
        self.repo = repo

    async def get_tenants(self, skip: int = 0, limit: int = 100, filters: Optional[dict[str, Any]] = None) -> list[Tenant]:
        ...

    async def get_tenant(self, id: str) -> Tenant:
        ...

    async def create_tenant(self, data: dict[str, Any]) -> Tenant:
        ...

    async def update_tenant(self, id: str, data: dict[str, Any]) -> Tenant:
        ...

    async def delete_tenant(self, id: str) -> None:
        ...
