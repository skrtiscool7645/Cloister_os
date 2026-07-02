from fastapi import APIRouter

from app.api.v1.admin import router as admin_router
from app.api.v1.ai import router as ai_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.audit_logs import router as audit_logs_router
from app.api.v1.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.documents import router as documents_router
from app.api.v1.employees import router as employees_router
from app.api.v1.equipment import router as equipment_router
from app.api.v1.inventory import router as inventory_router
from app.api.v1.leases import router as leases_router
from app.api.v1.maintenance import router as maintenance_router
from app.api.v1.messaging import router as messaging_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.properties import router as properties_router
from app.api.v1.reports import router as reports_router
from app.api.v1.schedules import router as schedules_router
from app.api.v1.settings import router as settings_router
from app.api.v1.tenants import router as tenants_router
from app.api.v1.units import router as units_router
from app.api.v1.users import router as users_router
from app.api.v1.vendors import router as vendors_router
from app.api.v1.work_orders import router as work_orders_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(properties_router)
api_router.include_router(units_router)
api_router.include_router(tenants_router)
api_router.include_router(leases_router)
api_router.include_router(maintenance_router)
api_router.include_router(work_orders_router)
api_router.include_router(schedules_router)
api_router.include_router(employees_router)
api_router.include_router(inventory_router)
api_router.include_router(equipment_router)
api_router.include_router(vendors_router)
api_router.include_router(documents_router)
api_router.include_router(messaging_router)
api_router.include_router(notifications_router)
api_router.include_router(reports_router)
api_router.include_router(analytics_router)
api_router.include_router(ai_router)
api_router.include_router(admin_router)
api_router.include_router(audit_logs_router)
api_router.include_router(dashboard_router)
api_router.include_router(settings_router)
