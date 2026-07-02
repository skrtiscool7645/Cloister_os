import uuid
from typing import Any

from app.models.notification import Notification


class NotificationService:
    def __init__(self, repo: Any) -> None:
        self.repo = repo

    async def get_notifications(self, user_id: str, skip: int = 0, limit: int = 100) -> list[Notification]:
        ...

    async def mark_read(self, id: str) -> None:
        ...

    async def mark_all_read(self, user_id: str) -> None:
        ...

    async def send_notification(self, data: dict[str, Any]) -> Notification:
        ...
