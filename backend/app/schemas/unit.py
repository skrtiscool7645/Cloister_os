from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


class UnitResponse(BaseModel):
    id: UUID
    property_id: UUID
    unit_label: str
    unit_type: str
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    sqft: Optional[float] = None
    monthly_rent: Optional[float] = None
    security_deposit: Optional[float] = None
    status: str
    floor: Optional[int] = None
    features: Optional[dict] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UnitCreate(BaseModel):
    property_id: UUID
    unit_label: str = Field(..., max_length=50)
    unit_type: str = Field(default="apartment", max_length=50)
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    sqft: Optional[float] = None
    monthly_rent: Optional[float] = None
    security_deposit: Optional[float] = None
    status: str = Field(default="vacant", max_length=50)
    floor: Optional[int] = None
    features: Optional[dict] = None
    notes: Optional[str] = None


class UnitUpdate(BaseModel):
    unit_label: Optional[str] = Field(default=None, max_length=50)
    unit_type: Optional[str] = Field(default=None, max_length=50)
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    sqft: Optional[float] = None
    monthly_rent: Optional[float] = None
    security_deposit: Optional[float] = None
    status: Optional[str] = Field(default=None, max_length=50)
    floor: Optional[int] = None
    features: Optional[dict] = None
    notes: Optional[str] = None


class UnitListResponse(BaseModel):
    data: list[UnitResponse]
    meta: dict
