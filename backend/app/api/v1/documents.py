import uuid
from typing import Optional, Annotated, Any

from fastapi import APIRouter, Depends, Query, UploadFile, File

from app.api.deps import get_current_user
from app.exceptions import NotFoundException
from app.models.base import get_session
from app.models.document import Document
from app.repositories import DocumentRepository

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("")
async def list_documents(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    related_type: Optional[str] = None,
    related_id: Optional[str] = None,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        filters = []
        if related_type:
            filters.append(Document.related_type == related_type)
        if related_id:
            filters.append(Document.related_id == related_id)
        repo = DocumentRepository(session)
        docs = await repo.get_all(*filters)
        return {
            "items": [d.dict() for d in docs[skip : skip + limit]],
            "total": len(docs),
            "skip": skip,
            "limit": limit,
        }


@router.post("", status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    metadata: Optional[str] = None,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    import json
    async with get_session() as session:
        import shutil
        import os
        from app.config import settings
        upload_dir = getattr(settings, "upload_dir", "/tmp/uploads")
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        meta = json.loads(metadata) if metadata else {}
        doc_data = {
            "name": meta.get("name", file.filename or "unnamed"),
            "file_path": file_path,
            "file_type": file.content_type,
            "file_size": meta.get("file_size"),
            "related_type": meta.get("related_type"),
            "related_id": meta.get("related_id"),
            "property_id": meta.get("property_id"),
            "uploaded_by": current_user.get("sub"),
            "version": 1,
        }
        repo = DocumentRepository(session)
        doc = await repo.create(doc_data)
        await session.commit()
        return doc.dict()


@router.get("/{document_id}")
async def get_document(
    document_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        repo = DocumentRepository(session)
        doc = await repo.get(document_id)
        if not doc:
            raise NotFoundException("Document", str(document_id))
        return doc.dict()


@router.patch("/{document_id}")
async def update_document(
    document_id: str,
    body: dict[str, Any],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    async with get_session() as session:
        repo = DocumentRepository(session)
        doc = await repo.update(document_id, body)
        if not doc:
            raise NotFoundException("Document", str(document_id))
        await session.commit()
        return doc.dict()


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, str]:
    async with get_session() as session:
        repo = DocumentRepository(session)
        existing = await repo.get(document_id)
        if not existing:
            raise NotFoundException("Document", str(document_id))
        await repo.delete(document_id)
        await session.commit()
        return {"message": "Document deleted"}


@router.get("/{document_id}/versions")
async def get_document_versions(
    document_id: str,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    async with get_session() as session:
        from sqlalchemy import text
        result = await session.execute(
            text("SELECT * FROM document_versions WHERE document_id = :did ORDER BY version DESC"),
            {"did": document_id},
        )
        rows = result.mappings().all()
        return {"items": [dict(r) for r in rows]}


@router.post("/{document_id}/versions", status_code=201)
async def upload_new_version(
    document_id: str,
    file: UploadFile = File(...),
    current_user: Annotated[dict[str, Any], Depends(get_current_user)] = None,
) -> dict[str, Any]:
    import shutil
    import os
    from app.config import settings
    async with get_session() as session:
        repo = DocumentRepository(session)
        doc = await repo.get(document_id)
        if not doc:
            raise NotFoundException("Document", str(document_id))
        upload_dir = getattr(settings, "upload_dir", "/tmp/uploads")
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        new_version = doc.version + 1
        await session.execute(
            __import__("sqlalchemy").text(
                "INSERT INTO document_versions (document_id, version, file_path, file_type, file_size, uploaded_by) "
                "VALUES (:did, :ver, :fp, :ft, :fs, :ub)"
            ),
            {
                "did": document_id,
                "ver": new_version,
                "fp": file_path,
                "ft": file.content_type,
                "fs": None,
                "ub": current_user.get("sub"),
            },
        )
        updated = await repo.update(document_id, {
            "version": new_version,
            "file_path": file_path,
            "file_type": file.content_type,
        })
        await session.commit()
        return updated.dict()
