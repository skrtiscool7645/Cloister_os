from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    type: str
    title: str
    body: Optional[str] = None
    link: Optional[str] = None
    read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class NotificationCreate(BaseModel):
    user_id: UUID
    type: str = Field(..., max_length=50)
    title: str = Field(..., max_length=255)
    body: Optional[str] = None
    link: Optional[str] = None


class NotificationUpdate(BaseModel):
    read_at: Optional[datetime] = None


class NotificationListResponse(BaseModel):
    data: list[NotificationResponse]
    meta: dict
