from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


class VendorResponse(BaseModel):
    id: UUID
    company_name: str
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VendorCreate(BaseModel):
    company_name: str = Field(..., max_length=255)
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True


class VendorUpdate(BaseModel):
    company_name: Optional[str] = Field(default=None, max_length=255)
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class VendorListResponse(BaseModel):
    data: list[VendorResponse]
    meta: dict
