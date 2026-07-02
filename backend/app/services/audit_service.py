import uuid
from typing import Optional, Any

from app.models.audit_log import AuditLog


class AuditService:
    def __init__(self, repo: Any) -> None:
        self.repo = repo

    async def get_logs(self, skip: int = 0, limit: int = 100, filters: Optional[dict[str, Any]] = None) -> list[AuditLog]:
        ...

    async def get_log(self, id: str) -> AuditLog:
        ...

    async def log_action(self, data: dict[str, Any]) -> AuditLog:
        ...
