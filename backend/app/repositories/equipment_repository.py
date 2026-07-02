from sqlalchemy.ext.asyncio import AsyncSession

from app.models.equipment import Equipment
from app.repositories.base import BaseRepository


class EquipmentRepository(BaseRepository[Equipment]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Equipment)
