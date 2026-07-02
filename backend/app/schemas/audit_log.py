from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


class AuditLogResponse(BaseModel):
    id: UUID
    user_id: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    changes: Optional[dict] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AuditLogListResponse(BaseModel):
    data: list[AuditLogResponse]
    meta: dict
