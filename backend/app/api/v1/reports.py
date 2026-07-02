import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user
from app.exceptions import NotFoundException
from app.models.base import get_session

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("")
async def list_reports(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        from sqlalchemy import text
        result = await session.execute(
            text("SELECT * FROM report_definitions WHERE deleted_at IS NULL ORDER BY created_at DESC"),
        )
        rows = result.mappings().all()
        return {
            "items": [dict(r) for r in rows[skip : skip + limit]],
            "total": len(rows),
            "skip": skip,
            "limit": limit,
        }


@router.post("", status_code=201)
async def create_report(
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        from sqlalchemy import text
        result = await session.execute(
            text(
                "INSERT INTO report_definitions (name, description, report_type, config, created_at, updated_at) "
                "VALUES (:name, :desc, :rtype, :config, NOW(), NOW()) RETURNING *"
            ),
            {
                "name": body["name"],
                "desc": body.get("description"),
                "rtype": body.get("report_type", "custom"),
                "config": body.get("config", {}),
            },
        )
        await session.commit()
        row = result.mappings().first()
        return dict(row)


@router.get("/{report_id}")
async def get_report(
    report_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        from sqlalchemy import text
        result = await session.execute(
            text("SELECT * FROM report_definitions WHERE id = :rid AND deleted_at IS NULL"),
            {"rid": report_id},
        )
        row = result.mappings().first()
        if not row:
            raise NotFoundException("Report", str(report_id))
        return dict(row)


@router.post("/{report_id}/generate")
async def generate_report(
    report_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        from sqlalchemy import text
        result = await session.execute(
            text("SELECT * FROM report_definitions WHERE id = :rid AND deleted_at IS NULL"),
            {"rid": report_id},
        )
        report = result.mappings().first()
        if not report:
            raise NotFoundException("Report", str(report_id))
        gen_result = await session.execute(
            text(
                "INSERT INTO report_results (report_definition_id, generated_by, parameters, status, created_at) "
                "VALUES (:rid, :uid, :params, 'completed', NOW()) RETURNING *"
            ),
            {
                "rid": report_id,
                "uid": current_user.get("sub"),
                "params": body.get("parameters", {}),
            },
        )
        await session.commit()
        row = gen_result.mappings().first()
        return dict(row)


@router.get("/{report_id}/download")
async def download_report(
    report_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        from sqlalchemy import text
        result = await session.execute(
            text("SELECT * FROM report_results WHERE report_definition_id = :rid ORDER BY created_at DESC LIMIT 1"),
            {"rid": report_id},
        )
        row = result.mappings().first()
        if not row:
            raise NotFoundException("Report result", str(report_id))
        return dict(row)
