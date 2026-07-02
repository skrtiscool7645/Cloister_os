from sqlalchemy.ext.asyncio import AsyncSession

from app.models.message import Message
from app.repositories.base import BaseRepository


class MessageRepository(BaseRepository[Message]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Message)
