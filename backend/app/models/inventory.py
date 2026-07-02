from typing import Optional
import uuid
from datetime import date

from sqlalchemy import Date, Float, Integer, String, Text, ForeignKey
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin


class InventoryCategory(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "inventory_categories"

    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    items = relationship("InventoryItem", back_populates="category", lazy="selectin")


class InventoryItem(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "inventory_items"

    category_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("inventory_categories.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sku: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    barcode: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    qr_code: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    quantity: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    unit_of_measure: Mapped[str] = mapped_column(String(50), nullable=False, default="each")
    min_stock_level: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=0)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    supplier_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("vendors.id", ondelete="SET NULL"), nullable=True
    )
    cost_per_unit: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    purchase_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    category = relationship("InventoryCategory", back_populates="items")
    supplier = relationship("Vendor", foreign_keys=[supplier_id])
