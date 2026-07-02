from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
    id: UUID
    sender_id: UUID
    subject: str
    body: str
    is_urgent: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MessageCreate(BaseModel):
    sender_id: UUID
    subject: str = Field(..., max_length=255)
    body: str
    is_urgent: bool = False
    recipient_ids: list[UUID]


class MessageUpdate(BaseModel):
    pass


class MessageListResponse(BaseModel):
    data: list[MessageResponse]
    meta: dict
