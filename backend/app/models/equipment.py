from typing import Optional
import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin


class EquipmentCategory(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "equipment_categories"

    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    equipment_items = relationship("Equipment", back_populates="category", lazy="selectin")


class Equipment(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "equipment"

    category_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("equipment_categories.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    make: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    model: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    serial_number: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, unique=True)
    year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    purchase_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    purchase_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    current_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="available")
    current_location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    assigned_employee_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    category = relationship("EquipmentCategory", back_populates="equipment_items")
    assigned_employee = relationship("User")
    maintenance_records = relationship("EquipmentMaintenanceRecord", back_populates="equipment", lazy="selectin")


class EquipmentMaintenanceRecord(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "equipment_maintenance_records"

    equipment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    performed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    cost: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    equipment = relationship("Equipment", back_populates="maintenance_records")
