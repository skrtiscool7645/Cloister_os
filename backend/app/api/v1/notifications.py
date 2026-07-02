import uuid
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, update as sa_update

from app.api.deps import get_current_user
from app.exceptions import NotFoundException
from app.models.base import get_session
from app.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    user_id = str(current_user["sub"])
    async with get_session() as session:
        result = await session.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
        )
        notifications = list(result.scalars().all())
        return {
            "items": [n.dict() for n in notifications[skip : skip + limit]],
            "total": len(notifications),
            "skip": skip,
            "limit": limit,
        }


@router.patch("/{notification_id}/read")
async def mark_as_read(
    notification_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    user_id = str(current_user["sub"])
    async with get_session() as session:
        result = await session.execute(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.user_id == user_id,
            )
        )
        notification = result.scalar_one_or_none()
        if not notification:
            raise NotFoundException("Notification", str(notification_id))
        notification.read_at = datetime.now(timezone.utc)
        await session.commit()
        return notification.dict()


@router.post("/read-all")
async def mark_all_read(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, str]:
    user_id = str(current_user["sub"])
    async with get_session() as session:
        await session.execute(
            sa_update(Notification)
            .where(Notification.user_id == user_id)
            .where(Notification.read_at.is_(None))
            .values(read_at=datetime.now(timezone.utc))
        )
        await session.commit()
        return {"message": "All notifications marked as read"}


@router.get("/unread-count")
async def unread_count(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    user_id = str(current_user["sub"])
    async with get_session() as session:
        result = await session.execute(
            select(func.count())
            .select_from(Notification)
            .where(Notification.user_id == user_id)
            .where(Notification.read_at.is_(None))
        )
        count = result.scalar()
        return {"unread_count": count}
