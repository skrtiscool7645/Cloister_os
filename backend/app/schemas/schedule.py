from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


class ScheduleResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    schedulable_type: Optional[str] = None
    schedulable_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    all_day: bool = False
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ScheduleCreate(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    schedulable_type: Optional[str] = None
    schedulable_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    all_day: bool = False
    status: str = "scheduled"


class ScheduleUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    schedulable_type: Optional[str] = None
    schedulable_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    all_day: Optional[bool] = None
    status: Optional[str] = None


class ScheduleListResponse(BaseModel):
    data: list[ScheduleResponse]
    meta: dict
