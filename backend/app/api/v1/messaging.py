import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func

from app.api.deps import get_current_user
from app.exceptions import NotFoundException
from app.models.base import get_session
from app.models.message import Message, MessageRecipient
from app.repositories import MessageRepository

router = APIRouter(prefix="/messages", tags=["messaging"])


@router.get("")
async def list_messages(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    user_id = str(current_user["sub"])
    async with get_session() as session:
        stmt = (
            select(Message)
            .join(MessageRecipient, MessageRecipient.message_id == Message.id)
            .where(MessageRecipient.recipient_id == user_id)
            .order_by(Message.created_at.desc())
        )
        result = await session.execute(stmt)
        messages = list(result.scalars().all())
        return {
            "items": [m.dict() for m in messages[skip : skip + limit]],
            "total": len(messages),
            "skip": skip,
            "limit": limit,
        }


@router.post("", status_code=201)
async def send_message(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    user_id = str(current_user["sub"])
    async with get_session() as session:
        message = Message(
            sender_id=user_id,
            subject=body["subject"],
            body=body["body"],
            is_urgent=body.get("is_urgent", False),
        )
        session.add(message)
        await session.flush()
        recipient_ids = body.get("recipient_ids", [])
        for rid in recipient_ids:
            recipient = MessageRecipient(
                message_id=message.id,
                recipient_id=str(rid) if isinstance(rid, str) else rid,
            )
            session.add(recipient)
        await session.flush()
        await session.refresh(message)
        await session.commit()
        return message.dict()


@router.get("/{message_id}")
async def get_message(
    message_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        repo = MessageRepository(session)
        message = await repo.get(message_id)
        if not message:
            raise NotFoundException("Message", str(message_id))
        from datetime import datetime, timezone
        await session.execute(
            __import__("sqlalchemy").update(MessageRecipient)
            .where(MessageRecipient.message_id == message_id)
            .where(MessageRecipient.recipient_id == str(current_user["sub"]))
            .values(read_at=datetime.now(timezone.utc))
        )
        await session.commit()
        return message.dict()


@router.delete("/{message_id}")
async def delete_message(
    message_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, str]:
    async with get_session() as session:
        repo = MessageRepository(session)
        message = await repo.get(message_id)
        if not message:
            raise NotFoundException("Message", str(message_id))
        user_id = str(current_user["sub"])
        await session.execute(
            __import__("sqlalchemy").delete(MessageRecipient)
            .where(MessageRecipient.message_id == message_id)
            .where(MessageRecipient.recipient_id == user_id)
        )
        await session.commit()
        return {"message": "Message deleted"}


@router.get("/unread-count")
async def unread_count(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    user_id = str(current_user["sub"])
    async with get_session() as session:
        result = await session.execute(
            select(func.count())
            .select_from(MessageRecipient)
            .where(MessageRecipient.recipient_id == user_id)
            .where(MessageRecipient.read_at.is_(None))
        )
        count = result.scalar()
        return {"unread_count": count}
