from sqlalchemy.ext.asyncio import AsyncSession

from app.models.settings import CompanySettings
from app.repositories.base import BaseRepository


class SettingsRepository(BaseRepository[CompanySettings]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, CompanySettings)
