import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends
from sqlalchemy import text

from app.api.deps import get_current_user
from app.models.base import get_session

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/chat")
async def chat(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        await session.execute(
            text(
                "INSERT INTO ai_conversations (user_id, role, content, created_at) "
                "VALUES (:uid, 'user', :msg, NOW())"
            ),
            {"uid": current_user.get("sub"), "msg": body.get("message", "")},
        )
        await session.commit()
        return {
            "reply": "I'm an AI assistant. I can help with property management questions.",
            "conversation_id": body.get("conversation_id"),
        }


@router.get("/conversations")
async def list_conversations(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        result = await session.execute(
            text(
                "SELECT DISTINCT ON (conversation_id) conversation_id, role, content, created_at "
                "FROM ai_conversations WHERE user_id = :uid ORDER BY conversation_id, created_at DESC"
            ),
            {"uid": current_user.get("sub")},
        )
        rows = result.mappings().all()
        return {"items": [dict(r) for r in rows]}


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, str]:
    async with get_session() as session:
        await session.execute(
            text("DELETE FROM ai_conversations WHERE conversation_id = :cid AND user_id = :uid"),
            {"cid": conversation_id, "uid": current_user.get("sub")},
        )
        await session.commit()
        return {"message": "Conversation deleted"}


@router.get("/models")
async def list_models(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    return {
        "models": [
            {"id": "gpt-4", "name": "GPT-4", "provider": "OpenAI"},
            {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "provider": "OpenAI"},
            {"id": "claude-3", "name": "Claude 3", "provider": "Anthropic"},
        ]
    }
