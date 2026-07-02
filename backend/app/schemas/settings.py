from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


class SettingsResponse(BaseModel):
    id: UUID
    key: str
    value: dict
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SettingsCreate(BaseModel):
    key: str = Field(..., max_length=255)
    value: dict


class SettingsUpdate(BaseModel):
    value: Optional[dict] = None


class SettingsListResponse(BaseModel):
    data: list[SettingsResponse]
    meta: dict
