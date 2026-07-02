from typing import Optional
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin


class Schedule(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "schedules"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    schedulable_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    schedulable_id: Mapped[Optional[str]] = mapped_column(
        String(36), nullable=True, index=True
    )
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    all_day: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="scheduled")
