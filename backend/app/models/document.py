from typing import Optional
import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin


class Document(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "documents"

    property_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("properties.id", ondelete="CASCADE"), nullable=True, index=True
    )
    related_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    related_id: Mapped[Optional[str]] = mapped_column(
        String(36), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    file_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    uploaded_by: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    property = relationship("Property", back_populates="documents")
    uploader = relationship("User")
