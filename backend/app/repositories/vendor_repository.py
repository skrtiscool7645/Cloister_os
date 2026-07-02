from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vendor import Vendor
from app.repositories.base import BaseRepository


class VendorRepository(BaseRepository[Vendor]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Vendor)
