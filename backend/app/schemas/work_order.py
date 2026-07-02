from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


class WorkOrderResponse(BaseModel):
    id: UUID
    maintenance_request_id: Optional[str] = None
    property_id: UUID
    unit_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    notes: Optional[str] = None
    completion_notes: Optional[str] = None
    is_billable: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WorkOrderCreate(BaseModel):
    maintenance_request_id: Optional[str] = None
    property_id: UUID
    unit_id: Optional[str] = None
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    priority: str = "medium"
    status: str = "pending"
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    notes: Optional[str] = None
    is_billable: bool = False


class WorkOrderUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    notes: Optional[str] = None
    completion_notes: Optional[str] = None
    is_billable: Optional[bool] = None


class WorkOrderListResponse(BaseModel):
    data: list[WorkOrderResponse]
    meta: dict
