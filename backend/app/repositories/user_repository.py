from typing import Optional
import json
from types import SimpleNamespace
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, User)

    async def get_by_email(self, email: str) -> Optional[User]:
        # Use raw SQL to avoid triggering ORM relationship mapper configuration
        # issues when the DB/schema lacks explicit foreign keys.
        stmt = text(
            "SELECT id, email, password_hash, is_active, first_name, last_name FROM users WHERE email = :email AND deleted_at IS NULL LIMIT 1"
        )
        result = await self.session.execute(stmt, {"email": email})
        row = result.first()
        if not row:
            return None

        user_id = row[0]

        # Fetch roles (raw) and construct lightweight role objects
        roles_stmt = text(
            "SELECT r.id, r.name, r.permissions FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = :uid"
        )
        roles_res = await self.session.execute(roles_stmt, {"uid": user_id})
        roles = []
        for r in roles_res.fetchall():
            perms = {}
            try:
                perms = json.loads(r[2]) if r[2] else {}
            except Exception:
                perms = {}
            role_obj = SimpleNamespace(name=r[1], permissions=perms)
            user_role = SimpleNamespace(role=role_obj)
            roles.append(user_role)

        # Build a lightweight user-like object with required attributes and dict()
        user_obj = SimpleNamespace(
            id=user_id,
            email=row[1],
            password_hash=row[2],
            is_active=bool(row[3]),
            first_name=row[4],
            last_name=row[5],
            roles=roles,
            dict=lambda: {
                "id": user_id,
                "email": row[1],
                "first_name": row[4],
                "last_name": row[5],
            },
        )
        return user_obj

    async def get_by_reset_token(self, token: str) -> Optional[User]:
        stmt = text(
            "SELECT id, email, password_hash, is_active, first_name, last_name FROM users WHERE password_reset_token = :token AND deleted_at IS NULL LIMIT 1"
        )
        result = await self.session.execute(stmt, {"token": token})
        row = result.first()
        if not row:
            return None
        user_id = row[0]
        user_obj = SimpleNamespace(
            id=user_id,
            email=row[1],
            password_hash=row[2],
            is_active=bool(row[3]),
            first_name=row[4],
            last_name=row[5],
            roles=[],
            dict=lambda: {"id": user_id, "email": row[1], "first_name": row[4], "last_name": row[5]},
        )
        return user_obj
