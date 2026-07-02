from typing import Any


class DashboardService:
    def __init__(self, repo: Any) -> None:
        self.repo = repo

    async def get_summary(self) -> dict[str, Any]:
        ...

    async def get_recent_activity(self, limit: int = 20) -> list[dict[str, Any]]:
        ...

    async def get_alerts(self) -> list[dict[str, Any]]:
        ...
