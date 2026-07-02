from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


class MaintenanceRequestResponse(BaseModel):
    id: UUID
    property_id: UUID
    unit_id: Optional[str] = None
    tenant_id: Optional[str] = None
    requested_by: UUID
    title: str
    description: Optional[str] = None
    priority: str
    category: Optional[str] = None
    status: str
    is_emergency: bool = False
    tenant_accessible: bool = True
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MaintenanceRequestCreate(BaseModel):
    property_id: UUID
    unit_id: Optional[str] = None
    tenant_id: Optional[str] = None
    requested_by: UUID
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    priority: str = "medium"
    category: Optional[str] = None
    status: str = "open"
    is_emergency: bool = False
    tenant_accessible: bool = True


class MaintenanceRequestUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    is_emergency: Optional[bool] = None
    tenant_accessible: Optional[bool] = None


class MaintenanceRequestListResponse(BaseModel):
    data: list[MaintenanceRequestResponse]
    meta: dict
