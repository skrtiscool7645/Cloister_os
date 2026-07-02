from typing import Optional
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String, func
from sqlalchemy.ext.asyncio import AsyncAttrs, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, registry

from app.config import settings

_url = settings.database_url

if _url.startswith("sqlite"):
    _dsn = _url.replace("sqlite://", "sqlite+aiosqlite://", 1)
elif _url.startswith("postgresql"):
    _dsn = _url
else:
    _dsn = f"sqlite+aiosqlite:///{_url}"

engine = create_async_engine(
    _dsn,
    echo=settings.debug,
)

SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(AsyncAttrs, DeclarativeBase):
    def dict(self) -> dict:
        return {
            c.key: getattr(self, c.key)
            for c in self.__table__.columns
        }


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class SoftDeleteMixin:
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
    )


class UUIDMixin:
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )


def get_session():
    return SessionLocal()
