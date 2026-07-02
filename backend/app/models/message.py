from typing import Optional
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Message(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "messages"

    sender_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    is_urgent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    sender = relationship("User", foreign_keys=[sender_id])
    recipients = relationship("MessageRecipient", back_populates="message", lazy="selectin")


class MessageRecipient(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "message_recipients"

    message_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False
    )
    recipient_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    message = relationship("Message", back_populates="recipients")
    recipient = relationship("User", foreign_keys=[recipient_id])
