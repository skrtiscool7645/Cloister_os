import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models.base import Base, engine, SessionLocal

@pytest.fixture
async def db_session():
    async with SessionLocal() as session:
        yield session

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def auth_headers():
    from app.core.auth.jwt_service import JWTService
    jwt = JWTService()
    token = jwt.create_access_token(
        user_id="00000000-0000-4000-a000-000000000001",
        email="admin",
        roles=["admin"],
        permissions={"properties": {"read": True, "create": True, "update": True, "delete": True}},
    )
    return {"Authorization": f"Bearer {token}"}
