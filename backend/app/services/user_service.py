import uuid
from typing import Any

from app.exceptions import NotFoundException
from app.models.user import User
from app.repositories.user_repository import UserRepository


class UserService:
    def __init__(self, user_repo: UserRepository) -> None:
        self.user_repo = user_repo

    async def get_users(self) -> list[User]:
        return await self.user_repo.list()

    async def get_user(self, id: str) -> User:
        user = await self.user_repo.get_by_id(id)
        if not user:
            raise NotFoundException("User", str(id))
        return user

    async def create_user(self, data: dict[str, Any]) -> User:
        return await self.user_repo.create(data)

    async def update_user(self, id: str, data: dict[str, Any]) -> User:
        user = await self.user_repo.get_by_id(id)
        if not user:
            raise NotFoundException("User", str(id))
        return await self.user_repo.update(id, data)

    async def delete_user(self, id: str) -> None:
        user = await self.user_repo.get_by_id(id)
        if not user:
            raise NotFoundException("User", str(id))
        await self.user_repo.soft_delete(id)
