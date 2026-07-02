from typing import Optional
import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin


class Inspection(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "inspections"

    property_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True
    )
    unit_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("units.id", ondelete="SET NULL"), nullable=True
    )
    inspector_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    inspection_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    findings: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=dict)

    property = relationship("Property", back_populates="inspections")
    unit = relationship("Unit")
    inspector = relationship("User", foreign_keys=[inspector_id])
