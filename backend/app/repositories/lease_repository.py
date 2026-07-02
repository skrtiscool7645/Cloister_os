from sqlalchemy.ext.asyncio import AsyncSession

from app.models.property import Lease
from app.repositories.base import BaseRepository


class LeaseRepository(BaseRepository[Lease]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Lease)
