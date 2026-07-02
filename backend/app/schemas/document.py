from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


class DocumentResponse(BaseModel):
    id: UUID
    property_id: Optional[str] = None
    related_type: Optional[str] = None
    related_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    file_path: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    version: int = 1
    uploaded_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DocumentCreate(BaseModel):
    property_id: Optional[str] = None
    related_type: Optional[str] = None
    related_id: Optional[str] = None
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    file_path: str = Field(..., max_length=500)
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    version: int = 1
    uploaded_by: Optional[str] = None


class DocumentUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    version: Optional[int] = None


class DocumentListResponse(BaseModel):
    data: list[DocumentResponse]
    meta: dict
