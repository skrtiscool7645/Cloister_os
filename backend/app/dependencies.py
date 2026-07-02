from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth.jwt_service import JWTService
from app.core.auth.permissions import PermissionRegistry
from app.models.base import get_session
from app.repositories.audit_log_repository import AuditLogRepository
from app.repositories.document_repository import DocumentRepository
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.equipment_repository import EquipmentRepository
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.lease_repository import LeaseRepository
from app.repositories.maintenance_request_repository import MaintenanceRequestRepository
from app.repositories.message_repository import MessageRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.property_repository import PropertyRepository
from app.repositories.schedule_repository import ScheduleRepository
from app.repositories.settings_repository import SettingsRepository
from app.repositories.tenant_repository import TenantRepository
from app.repositories.unit_repository import UnitRepository
from app.repositories.user_repository import UserRepository
from app.repositories.vendor_repository import VendorRepository
from app.repositories.work_order_repository import WorkOrderRepository
from app.services.auth_service import AuthService
from app.config import settings
from app.services.user_service import UserService


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with get_session() as session:
        yield session


def get_jwt_service() -> JWTService:
    return JWTService()


def get_permission_registry() -> PermissionRegistry:
    return PermissionRegistry()


async def get_user_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> UserRepository:
    return UserRepository(db)


async def get_property_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> PropertyRepository:
    return PropertyRepository(db)


async def get_unit_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> UnitRepository:
    return UnitRepository(db)


async def get_tenant_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> TenantRepository:
    return TenantRepository(db)


async def get_lease_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> LeaseRepository:
    return LeaseRepository(db)


async def get_maintenance_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> MaintenanceRequestRepository:
    return MaintenanceRequestRepository(db)


async def get_work_order_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> WorkOrderRepository:
    return WorkOrderRepository(db)


async def get_schedule_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> ScheduleRepository:
    return ScheduleRepository(db)


async def get_employee_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> EmployeeRepository:
    return EmployeeRepository(db)


async def get_inventory_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> InventoryRepository:
    return InventoryRepository(db)


async def get_equipment_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> EquipmentRepository:
    return EquipmentRepository(db)


async def get_vendor_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> VendorRepository:
    return VendorRepository(db)


async def get_document_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> DocumentRepository:
    return DocumentRepository(db)


async def get_message_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> MessageRepository:
    return MessageRepository(db)


async def get_notification_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> NotificationRepository:
    return NotificationRepository(db)


async def get_audit_log_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> AuditLogRepository:
    return AuditLogRepository(db)


async def get_settings_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> SettingsRepository:
    return SettingsRepository(db)


async def get_auth_service(
    user_repo: Annotated[UserRepository, Depends(get_user_repo)],
    jwt_service: Annotated[JWTService, Depends(get_jwt_service)],
) -> AuthService:
    return AuthService(user_repo, jwt_service)


async def get_user_service(
    user_repo: Annotated[UserRepository, Depends(get_user_repo)],
) -> UserService:
    return UserService(user_repo)


async def get_current_user(
    request: Request,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict:
    auth_header = request.headers.get("Authorization", "")
    # If no Authorization header is present, allow anonymous access by returning
    # a default admin-like payload so the frontend can load without login.
    if not auth_header.startswith("Bearer "):
        return {
            "sub": "00000000-0000-4000-a000-000000000001",
            "email": "admin",
            "roles": ["ADMIN"],
            "permissions": {"all": {"read": True, "create": True, "update": True, "delete": True}},
        }
    token = auth_header.removeprefix("Bearer ")
    return auth_service.validate_access_token(token)
