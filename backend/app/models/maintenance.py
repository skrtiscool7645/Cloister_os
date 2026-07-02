from typing import Optional
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin


class MaintenanceRequest(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "maintenance_requests"

    property_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True
    )
    unit_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("units.id", ondelete="SET NULL"), nullable=True, index=True
    )
    tenant_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True
    )
    requested_by: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")
    is_emergency: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    tenant_accessible: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    property = relationship("Property", back_populates="maintenance_requests")
    unit = relationship("Unit")
    tenant = relationship("Tenant")
    requester = relationship("User", foreign_keys=[requested_by])
    work_orders = relationship("WorkOrder", back_populates="maintenance_request", lazy="selectin")


class WorkOrder(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "work_orders"

    maintenance_request_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("maintenance_requests.id", ondelete="SET NULL"), nullable=True
    )
    property_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True
    )
    unit_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("units.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    scheduled_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    scheduled_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    actual_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    actual_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    estimated_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    actual_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    completion_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_billable: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    property = relationship("Property", back_populates="work_orders")
    maintenance_request = relationship("MaintenanceRequest", back_populates="work_orders")
    unit = relationship("Unit")
    assignees = relationship("WorkOrderAssignee", back_populates="work_order", lazy="selectin")
    materials = relationship("WorkOrderMaterial", back_populates="work_order", lazy="selectin")


class WorkOrderAssignee(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "work_order_assignees"

    work_order_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("work_orders.id", ondelete="CASCADE"), nullable=False
    )
    employee_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    work_order = relationship("WorkOrder", back_populates="assignees")
    employee = relationship("User")


class WorkOrderMaterial(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "work_order_materials"

    work_order_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("work_orders.id", ondelete="CASCADE"), nullable=False
    )
    inventory_item_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("inventory_items.id", ondelete="SET NULL"), nullable=False
    )
    quantity_used: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    unit_cost: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    work_order = relationship("WorkOrder", back_populates="materials")
    inventory_item = relationship("InventoryItem")
