import uuid
from typing import Optional, Annotated, Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import and_

from app.api.deps import get_current_user
from app.exceptions import NotFoundException
from app.models.base import get_session
from app.models.schedule import Schedule
from app.repositories import ScheduleRepository

router = APIRouter(prefix="/schedules", tags=["schedules"])


@router.get("")
async def list_schedules(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    status: Optional[str] = None,
    schedulable_type: Optional[str] = None,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        filters = []
        if status:
            filters.append(Schedule.status == status)
        if schedulable_type:
            filters.append(Schedule.schedulable_type == schedulable_type)
        repo = ScheduleRepository(session)
        schedules = await repo.get_all(*filters)
        return {
            "items": [s.dict() for s in schedules[skip : skip + limit]],
            "total": len(schedules),
            "skip": skip,
            "limit": limit,
        }


@router.post("", status_code=201)
async def create_schedule(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = ScheduleRepository(session)
        schedule = await repo.create(body)
        await session.commit()
        return schedule.dict()


@router.patch("/{schedule_id}")
async def update_schedule(
    schedule_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = ScheduleRepository(session)
        schedule = await repo.update(schedule_id, body)
        if not schedule:
            raise NotFoundException("Schedule", str(schedule_id))
        await session.commit()
        return schedule.dict()


@router.delete("/{schedule_id}")
async def delete_schedule(
    schedule_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, str]:
    async with get_session() as session:
        repo = ScheduleRepository(session)
        existing = await repo.get(schedule_id)
        if not existing:
            raise NotFoundException("Schedule", str(schedule_id))
        await repo.delete(schedule_id)
        await session.commit()
        return {"message": "Schedule deleted"}


@router.get("/calendar")
async def calendar_view(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        from datetime import datetime
        filters = [Schedule.deleted_at.is_(None)]
        if start_date:
            filters.append(Schedule.start_time >= datetime.fromisoformat(start_date))
        if end_date:
            filters.append(Schedule.end_time <= datetime.fromisoformat(end_date))
        repo = ScheduleRepository(session)
        schedules = await repo.get_all(*filters)
        return {"items": [s.dict() for s in schedules]}
