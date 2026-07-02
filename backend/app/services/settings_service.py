import uuid
from typing import Any

from app.models.settings import CompanySettings


class SettingsService:
    def __init__(self, repo: Any) -> None:
        self.repo = repo

    async def get_settings(self) -> CompanySettings:
        ...

    async def update_settings(self, data: dict[str, Any]) -> CompanySettings:
        ...
