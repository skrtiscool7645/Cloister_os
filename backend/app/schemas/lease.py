from typing import Optional
from uuid import UUID
from datetime import date, datetime

from pydantic import BaseModel, Field


class LeaseResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    unit_id: UUID
    start_date: date
    end_date: date
    monthly_rent: float
    security_deposit: Optional[float] = None
    deposit_held_by: str
    status: str
    terms: Optional[str] = None
    auto_renew: bool = False
    renewal_notice_days: int = 60
    signed_at: Optional[datetime] = None
    terminated_at: Optional[datetime] = None
    termination_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LeaseCreate(BaseModel):
    tenant_id: UUID
    unit_id: UUID
    start_date: date
    end_date: date
    monthly_rent: float
    security_deposit: Optional[float] = None
    deposit_held_by: str = "landlord"
    status: str = "active"
    terms: Optional[str] = None
    auto_renew: bool = False
    renewal_notice_days: int = 60


class LeaseUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    monthly_rent: Optional[float] = None
    security_deposit: Optional[float] = None
    deposit_held_by: Optional[str] = None
    status: Optional[str] = None
    terms: Optional[str] = None
    auto_renew: Optional[bool] = None
    renewal_notice_days: Optional[int] = None


class LeaseListResponse(BaseModel):
    data: list[LeaseResponse]
    meta: dict
