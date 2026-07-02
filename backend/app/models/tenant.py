from typing import Optional
import uuid
from datetime import date

from sqlalchemy import Date, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin


class Tenant(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "tenants"

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    phone_alt: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    emergency_contact_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    emergency_contact_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    emergency_contact_relation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    ssn_last4: Mapped[Optional[str]] = mapped_column(String(4), nullable=True)
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    employer: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    annual_income: Mapped[Optional[float]] = mapped_column(nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
