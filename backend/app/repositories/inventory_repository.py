from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inventory import InventoryItem
from app.repositories.base import BaseRepository


class InventoryRepository(BaseRepository[InventoryItem]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, InventoryItem)
