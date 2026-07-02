from typing import Any


class AnalyticsService:
    def __init__(self, repo: Any) -> None:
        self.repo = repo

    async def get_dashboard_metrics(self) -> dict[str, Any]:
        ...

    async def get_occupancy_trends(self, months: int = 12) -> list[dict[str, Any]]:
        ...

    async def get_revenue_analysis(self, months: int = 12) -> dict[str, Any]:
        ...
