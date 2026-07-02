import uuid
from typing import Optional, Annotated, Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select

from app.api.deps import get_current_user
from app.exceptions import NotFoundException
from app.models.base import get_session
from app.models.maintenance import WorkOrder, WorkOrderAssignee
from app.models.schedule import Schedule
from app.models.user import User
from app.repositories import EmployeeRepository

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("")
async def list_employees(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        repo = EmployeeRepository(session)
        employees = await repo.get_all()
        return {
            "items": [e.dict() for e in employees[skip : skip + limit]],
            "total": len(employees),
            "skip": skip,
            "limit": limit,
        }


@router.post("", status_code=201)
async def create_employee(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = EmployeeRepository(session)
        employee = await repo.create(body)
        await session.commit()
        return employee.dict()


@router.get("/{employee_id}")
async def get_employee(
    employee_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = EmployeeRepository(session)
        employee = await repo.get(employee_id)
        if not employee:
            raise NotFoundException("Employee", str(employee_id))
        return employee.dict()


@router.patch("/{employee_id}")
async def update_employee(
    employee_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = EmployeeRepository(session)
        employee = await repo.update(employee_id, body)
        if not employee:
            raise NotFoundException("Employee", str(employee_id))
        await session.commit()
        return employee.dict()


@router.delete("/{employee_id}")
async def delete_employee(
    employee_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, str]:
    async with get_session() as session:
        repo = EmployeeRepository(session)
        existing = await repo.get(employee_id)
        if not existing:
            raise NotFoundException("Employee", str(employee_id))
        await repo.delete(employee_id)
        await session.commit()
        return {"message": "Employee deleted"}


@router.get("/{employee_id}/work-orders")
async def get_employee_work_orders(
    employee_id: str,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        stmt = (
            select(WorkOrder)
            .join(WorkOrderAssignee, WorkOrderAssignee.work_order_id == WorkOrder.id)
            .where(WorkOrder.deleted_at.is_(None))
            .where(WorkOrderAssignee.employee_id == employee_id)
            .order_by(WorkOrder.created_at.desc())
        )
        result = await session.execute(stmt)
        orders = list(result.scalars().all())
        return {
            "items": [o.dict() for o in orders[skip : skip + limit]],
            "total": len(orders),
        }


@router.get("/{employee_id}/schedule")
async def get_employee_schedule(
    employee_id: str,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        repo = ScheduleRepository(session)
        schedules = await repo.get_all(
            Schedule.schedulable_type == "employee",
            Schedule.schedulable_id == employee_id,
        )
        return {
            "items": [s.dict() for s in schedules[skip : skip + limit]],
            "total": len(schedules),
        }
