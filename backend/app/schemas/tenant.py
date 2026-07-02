from typing import Optional
from uuid import UUID
from datetime import date, datetime

from pydantic import BaseModel, Field


class TenantResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    phone_alt: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    ssn_last4: Optional[str] = None
    date_of_birth: Optional[date] = None
    employer: Optional[str] = None
    annual_income: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TenantCreate(BaseModel):
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    email: Optional[str] = None
    phone: Optional[str] = None
    phone_alt: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    ssn_last4: Optional[str] = None
    date_of_birth: Optional[date] = None
    employer: Optional[str] = None
    annual_income: Optional[float] = None
    notes: Optional[str] = None


class TenantUpdate(BaseModel):
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    email: Optional[str] = None
    phone: Optional[str] = None
    phone_alt: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    ssn_last4: Optional[str] = None
    date_of_birth: Optional[date] = None
    employer: Optional[str] = None
    annual_income: Optional[float] = None
    notes: Optional[str] = None


class TenantListResponse(BaseModel):
    data: list[TenantResponse]
    meta: dict
