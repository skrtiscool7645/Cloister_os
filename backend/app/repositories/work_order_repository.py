from sqlalchemy.ext.asyncio import AsyncSession

from app.models.maintenance import WorkOrder
from app.repositories.base import BaseRepository


class WorkOrderRepository(BaseRepository[WorkOrder]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, WorkOrder)
