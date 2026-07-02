from sqlalchemy.ext.asyncio import AsyncSession

from app.models.property import Unit
from app.repositories.base import BaseRepository


class UnitRepository(BaseRepository[Unit]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Unit)
