from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


class PropertyResponse(BaseModel):
    id: UUID
    name: str
    property_type: str
    status: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    zip_code: str
    country: str = "US"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    owner_name: Optional[str] = None
    owner_contact: Optional[str] = None
    year_built: Optional[int] = None
    total_units: int = 0
    total_sqft: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PropertyCreate(BaseModel):
    name: str = Field(..., max_length=255)
    property_type: str = Field(default="residential", max_length=50)
    status: str = Field(default="active", max_length=50)
    address_line1: str = Field(..., max_length=255)
    address_line2: Optional[str] = Field(default=None, max_length=255)
    city: str = Field(..., max_length=100)
    state: str = Field(..., max_length=50)
    zip_code: str = Field(..., max_length=20)
    country: str = Field(default="US", max_length=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    owner_name: Optional[str] = Field(default=None, max_length=255)
    owner_contact: Optional[str] = None
    year_built: Optional[int] = None
    total_units: int = 0
    total_sqft: Optional[float] = None
    notes: Optional[str] = None


class PropertyUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=255)
    property_type: Optional[str] = Field(default=None, max_length=50)
    status: Optional[str] = Field(default=None, max_length=50)
    address_line1: Optional[str] = Field(default=None, max_length=255)
    address_line2: Optional[str] = Field(default=None, max_length=255)
    city: Optional[str] = Field(default=None, max_length=100)
    state: Optional[str] = Field(default=None, max_length=50)
    zip_code: Optional[str] = Field(default=None, max_length=20)
    country: Optional[str] = Field(default=None, max_length=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    owner_name: Optional[str] = Field(default=None, max_length=255)
    owner_contact: Optional[str] = None
    year_built: Optional[int] = None
    total_units: Optional[int] = None
    total_sqft: Optional[float] = None
    notes: Optional[str] = None


class PropertyListResponse(BaseModel):
    data: list[PropertyResponse]
    meta: dict
