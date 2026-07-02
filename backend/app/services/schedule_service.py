import uuid
from typing import Optional, Any

from app.models.schedule import Schedule


class ScheduleService:
    def __init__(self, repo: Any) -> None:
        self.repo = repo

    async def get_schedules(self, skip: int = 0, limit: int = 100, filters: Optional[dict[str, Any]] = None) -> list[Schedule]:
        ...

    async def get_schedule(self, id: str) -> Schedule:
        ...

    async def create_schedule(self, data: dict[str, Any]) -> Schedule:
        ...

    async def update_schedule(self, id: str, data: dict[str, Any]) -> Schedule:
        ...

    async def delete_schedule(self, id: str) -> None:
        ...
