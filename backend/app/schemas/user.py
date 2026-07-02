from typing import Optional
from uuid import UUID as PyUUID
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    id: PyUUID
    email: EmailStr
    first_name: str
    last_name: str
    full_name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool = True
    roles: list = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = None
    role_ids: Optional[list[PyUUID]] = None


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None


class UserListResponse(BaseModel):
    data: list[UserResponse]
    meta: dict
