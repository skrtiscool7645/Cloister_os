from typing import Optional, Any


class AIService:
    def __init__(self, repo: Any) -> None:
        self.repo = repo

    async def chat(self, message: str, context: Optional[dict[str, Any]] = None) -> dict[str, Any]:
        ...

    async def analyze(self, data: dict[str, Any]) -> dict[str, Any]:
        ...

    async def suggest(self, entity_type: str, params: dict[str, Any]) -> list[dict[str, Any]]:
        ...
