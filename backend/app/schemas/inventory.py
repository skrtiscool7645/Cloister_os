from typing import Optional
from uuid import UUID
from datetime import date, datetime

from pydantic import BaseModel, Field


class InventoryItemResponse(BaseModel):
    id: UUID
    category_id: UUID
    name: str
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    qr_code: Optional[str] = None
    quantity: float
    unit_of_measure: str
    min_stock_level: Optional[float] = 0
    location: Optional[str] = None
    supplier_id: Optional[str] = None
    cost_per_unit: Optional[float] = None
    purchase_date: Optional[date] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class InventoryItemCreate(BaseModel):
    category_id: UUID
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    qr_code: Optional[str] = None
    quantity: float = 0
    unit_of_measure: str = "each"
    min_stock_level: Optional[float] = 0
    location: Optional[str] = None
    supplier_id: Optional[str] = None
    cost_per_unit: Optional[float] = None
    purchase_date: Optional[date] = None
    notes: Optional[str] = None


class InventoryItemUpdate(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    qr_code: Optional[str] = None
    quantity: Optional[float] = None
    unit_of_measure: Optional[str] = None
    min_stock_level: Optional[float] = None
    location: Optional[str] = None
    supplier_id: Optional[str] = None
    cost_per_unit: Optional[float] = None
    purchase_date: Optional[date] = None
    notes: Optional[str] = None


class InventoryItemListResponse(BaseModel):
    data: list[InventoryItemResponse]
    meta: dict
