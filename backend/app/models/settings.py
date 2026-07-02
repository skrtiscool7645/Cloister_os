from typing import Optional
from sqlalchemy import String
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class CompanySettings(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "company_settings"

    key: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    value: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
