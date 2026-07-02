from typing import Optional
import uuid
from datetime import date

from sqlalchemy import Boolean, Date, Float, ForeignKey, String, Text
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin


class Vendor(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "vendors"

    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    contracts = relationship("VendorContract", back_populates="vendor", lazy="selectin")
    inventory_items = relationship("InventoryItem", foreign_keys="[InventoryItem.supplier_id]", lazy="selectin")


class VendorContract(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "vendor_contracts"

    vendor_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    terms: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    vendor = relationship("Vendor", back_populates="contracts")
