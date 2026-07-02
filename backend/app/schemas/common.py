from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginationParams(BaseModel):
    page: int = 1
    per_page: int = 25


class PaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    meta: dict


class ErrorResponse(BaseModel):
    error: dict


class SuccessResponse(BaseModel):
    message: str
