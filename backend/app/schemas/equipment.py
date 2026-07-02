from typing import Optional
from uuid import UUID
from datetime import date, datetime

from pydantic import BaseModel, Field


class EquipmentResponse(BaseModel):
    id: UUID
    category_id: UUID
    name: str
    make: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    year: Optional[int] = None
    purchase_date: Optional[date] = None
    purchase_price: Optional[float] = None
    current_value: Optional[float] = None
    status: str
    current_location: Optional[str] = None
    assigned_employee_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EquipmentCreate(BaseModel):
    category_id: UUID
    name: str = Field(..., max_length=255)
    make: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    year: Optional[int] = None
    purchase_date: Optional[date] = None
    purchase_price: Optional[float] = None
    current_value: Optional[float] = None
    status: str = "available"
    current_location: Optional[str] = None
    assigned_employee_id: Optional[str] = None
    notes: Optional[str] = None


class EquipmentUpdate(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = Field(default=None, max_length=255)
    make: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    year: Optional[int] = None
    purchase_date: Optional[date] = None
    purchase_price: Optional[float] = None
    current_value: Optional[float] = None
    status: Optional[str] = None
    current_location: Optional[str] = None
    assigned_employee_id: Optional[str] = None
    notes: Optional[str] = None


class EquipmentListResponse(BaseModel):
    data: list[EquipmentResponse]
    meta: dict
