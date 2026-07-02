from typing import Optional
from app.models.base import Base
from app.models.user import User
from app.models.role import Role, UserRole
from app.models.property import Property, Unit, Lease
from app.models.tenant import Tenant
from app.models.maintenance import MaintenanceRequest, WorkOrder, WorkOrderAssignee, WorkOrderMaterial
from app.models.inventory import InventoryItem, InventoryCategory
from app.models.equipment import Equipment, EquipmentCategory, EquipmentMaintenanceRecord
from app.models.vendor import Vendor, VendorContract
from app.models.document import Document
from app.models.message import Message, MessageRecipient
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.models.schedule import Schedule
from app.models.inspection import Inspection
from app.models.announcement import Announcement
from app.models.settings import CompanySettings

__all__ = [
    "Base",
    "User",
    "Role",
    "UserRole",
    "Property",
    "Unit",
    "Lease",
    "Tenant",
    "MaintenanceRequest",
    "WorkOrder",
    "WorkOrderAssignee",
    "WorkOrderMaterial",
    "InventoryItem",
    "InventoryCategory",
    "Equipment",
    "EquipmentCategory",
    "EquipmentMaintenanceRecord",
    "Vendor",
    "VendorContract",
    "Document",
    "Message",
    "MessageRecipient",
    "Notification",
    "AuditLog",
    "Schedule",
    "Inspection",
    "Announcement",
    "CompanySettings",
]
