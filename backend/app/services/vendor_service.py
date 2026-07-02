import uuid
from typing import Optional, Any

from app.models.vendor import Vendor


class VendorService:
    def __init__(self, repo: Any) -> None:
        self.repo = repo

    async def get_vendors(self, skip: int = 0, limit: int = 100, filters: Optional[dict[str, Any]] = None) -> list[Vendor]:
        ...

    async def get_vendor(self, id: str) -> Vendor:
        ...

    async def create_vendor(self, data: dict[str, Any]) -> Vendor:
        ...

    async def update_vendor(self, id: str, data: dict[str, Any]) -> Vendor:
        ...

    async def delete_vendor(self, id: str) -> None:
        ...
