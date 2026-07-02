import uuid
from typing import Optional, Any


class ReportService:
    def __init__(self, repo: Any) -> None:
        self.repo = repo

    async def get_reports(self, skip: int = 0, limit: int = 100, filters: Optional[dict[str, Any]] = None) -> list[Any]:
        ...

    async def get_report(self, id: str) -> Any:
        ...

    async def generate_report(self, report_type: str, params: dict[str, Any]) -> Any:
        ...

    async def delete_report(self, id: str) -> None:
        ...
