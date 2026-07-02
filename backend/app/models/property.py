from typing import Optional
import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Integer, String, Text, func, ForeignKey
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin


class Property(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "properties"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    property_type: Mapped[str] = mapped_column(String(50), nullable=False, default="residential")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")
    address_line1: Mapped[str] = mapped_column(String(255), nullable=False)
    address_line2: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(50), nullable=False)
    zip_code: Mapped[str] = mapped_column(String(20), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False, default="US")
    latitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    owner_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    owner_contact: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    year_built: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    total_units: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_sqft: Mapped[Optional[float]] = mapped_column(nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    units = relationship("Unit", back_populates="property", lazy="selectin")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="property", lazy="dynamic")
    work_orders = relationship("WorkOrder", back_populates="property", lazy="dynamic")
    documents = relationship("Document", back_populates="property", lazy="dynamic")
    inspections = relationship("Inspection", back_populates="property", lazy="dynamic")
    user_roles = relationship("UserRole", back_populates="property", lazy="dynamic")


class Unit(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "units"

    property_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True
    )
    unit_label: Mapped[str] = mapped_column(String(50), nullable=False)
    unit_type: Mapped[str] = mapped_column(String(50), nullable=False, default="apartment")
    bedrooms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    bathrooms: Mapped[Optional[float]] = mapped_column(nullable=True)
    sqft: Mapped[Optional[float]] = mapped_column(nullable=True)
    monthly_rent: Mapped[Optional[float]] = mapped_column(nullable=True)
    security_deposit: Mapped[Optional[float]] = mapped_column(nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="vacant")
    floor: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    features: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=dict)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    property = relationship("Property", back_populates="units")


class Lease(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "leases"

    tenant_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("tenants.id", ondelete="SET NULL"), nullable=False, index=True
    )
    unit_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("units.id", ondelete="SET NULL"), nullable=False, index=True
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    monthly_rent: Mapped[float] = mapped_column(nullable=False)
    security_deposit: Mapped[Optional[float]] = mapped_column(nullable=True)
    deposit_held_by: Mapped[str] = mapped_column(String(50), default="landlord")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")
    terms: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    auto_renew: Mapped[bool] = mapped_column(Boolean, default=False)
    renewal_notice_days: Mapped[int] = mapped_column(Integer, default=60)
    signed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    terminated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    termination_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
