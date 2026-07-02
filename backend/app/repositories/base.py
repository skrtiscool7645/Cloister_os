from typing import Optional, Any, Generic, TypeVar
from uuid import UUID

from sqlalchemy import delete as sa_delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, session: AsyncSession, model: type[ModelType]) -> None:
        self.session = session
        self.model = model
        self._soft_delete = hasattr(model, "deleted_at")

    async def get(self, id: UUID) -> Optional[ModelType]:
        stmt = select(self.model).where(self.model.id == id)
        if self._soft_delete:
            stmt = stmt.where(self.model.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(self, *filters: Any) -> list[ModelType]:
        stmt = select(self.model)
        if self._soft_delete:
            stmt = stmt.where(self.model.deleted_at.is_(None))
        if filters:
            stmt = stmt.where(*filters)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, data: dict[str, Any]) -> ModelType:
        instance = self.model(**data)
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def update(self, id: UUID, data: dict[str, Any]) -> Optional[ModelType]:
        stmt = (
            update(self.model)
            .where(self.model.id == id)
            .values(**data)
            .returning(self.model)
        )
        if self._soft_delete:
            stmt = stmt.where(self.model.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.scalar_one_or_none()

    async def delete(self, id: UUID) -> None:
        if self._soft_delete:
            stmt = (
                update(self.model)
                .where(self.model.id == id)
                .values(deleted_at=func.now())
            )
        else:
            stmt = sa_delete(self.model).where(self.model.id == id)
        await self.session.execute(stmt)
        await self.session.flush()
