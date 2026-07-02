import uuid
from typing import Optional, Any

from app.models.message import Message


class MessagingService:
    def __init__(self, repo: Any) -> None:
        self.repo = repo

    async def get_messages(self, skip: int = 0, limit: int = 100, filters: Optional[dict[str, Any]] = None) -> list[Message]:
        ...

    async def get_message(self, id: str) -> Message:
        ...

    async def send_message(self, data: dict[str, Any]) -> Message:
        ...

    async def delete_message(self, id: str) -> None:
        ...
