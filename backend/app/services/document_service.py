import uuid
from typing import Optional, Any

from app.models.document import Document


class DocumentService:
    def __init__(self, repo: Any) -> None:
        self.repo = repo

    async def get_documents(self, skip: int = 0, limit: int = 100, filters: Optional[dict[str, Any]] = None) -> list[Document]:
        ...

    async def get_document(self, id: str) -> Document:
        ...

    async def create_document(self, data: dict[str, Any]) -> Document:
        ...

    async def update_document(self, id: str, data: dict[str, Any]) -> Document:
        ...

    async def delete_document(self, id: str) -> None:
        ...
