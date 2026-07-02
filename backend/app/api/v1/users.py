from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])


@router.get("")
async def list_users():
    raise NotImplementedError


@router.post("")
async def create_user():
    raise NotImplementedError


@router.get("/{user_id}")
async def get_user():
    raise NotImplementedError


@router.patch("/{user_id}")
async def update_user():
    raise NotImplementedError


@router.delete("/{user_id}")
async def delete_user():
    raise NotImplementedError
