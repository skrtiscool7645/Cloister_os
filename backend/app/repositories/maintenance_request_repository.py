from sqlalchemy.ext.asyncio import AsyncSession

from app.models.maintenance import MaintenanceRequest
from app.repositories.base import BaseRepository


class MaintenanceRequestRepository(BaseRepository[MaintenanceRequest]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, MaintenanceRequest)
