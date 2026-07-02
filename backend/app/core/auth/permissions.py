
from typing import Any


_MODULES = [
    "admin",
    "analytics",
    "audit",
    "billing",
    "documents",
    "employees",
    "inventory",
    "leases",
    "maintenance",
    "messages",
    "properties",
    "reports",
    "tenants",
    "units",
    "vendors",
    "work_orders",
]

_ACTIONS = ["create", "read", "update", "delete", "approve", "assign", "generate", "start", "complete", "log_materials", "add_photos"]


def _crud(allowed: bool = False) -> dict[str, bool]:
    return {a: allowed for a in _ACTIONS}


def _default_permission_structure() -> dict[str, dict[str, bool]]:
    return {m: _crud(False) for m in _MODULES}


def _all_true() -> dict[str, bool]:
    return {a: True for a in _ACTIONS}


_DEFAULT_ROLES: dict[str, dict[str, dict[str, bool]]] = {
    "admin": {m: _all_true() for m in _MODULES},
    "manager": {
        "properties": _crud(True),
        "units": _crud(True),
        "tenants": _crud(True),
        "leases": _crud(True),
        "employees": {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "reports": {"create": True, "read": True, "update": False, "delete": False, "approve": False, "assign": False, "generate": True, **{a: False for a in _ACTIONS[7:]}},
        "analytics": {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "billing": _crud(True),
        "documents": _crud(True),
        "vendors": _crud(True),
        "maintenance": {"create": True, "read": True, "update": True, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "work_orders": {"create": True, "read": True, "update": True, "delete": False, "approve": True, "assign": True, **{a: False for a in _ACTIONS[6:]}},
        "inventory": {"create": True, "read": True, "update": True, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "messages": _crud(True),
        "admin": _crud(False),
        "audit": _crud(False),
    },
    "maint_supervisor": {
        "maintenance": _all_true(),
        "work_orders": {
            "create": True, "read": True, "update": True, "delete": False,
            "approve": True, "assign": True, "generate": False,
            "start": False, "complete": False, "log_materials": False, "add_photos": False,
        },
        "inventory": {"create": True, "read": True, "update": True, "delete": True, **{a: False for a in _ACTIONS[4:]}},
        "properties": {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "units": {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "tenants": {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "documents": _crud(True),
    },
    "maint_tech": {
        "maintenance": {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "work_orders": {
            "create": False, "read": True, "update": False, "delete": False,
            "approve": False, "assign": False, "generate": False,
            "start": True, "complete": True, "log_materials": True, "add_photos": True,
        },
        "properties": {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "units": {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "tenants": {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "inventory": {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
    },
    "office_staff": {
        "tenants": _crud(True),
        "leases": _crud(True),
        "vendors": _crud(True),
        "documents": _crud(True),
        "properties": {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "units": {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "billing": _crud(True),
        "messages": _crud(True),
    },
    "property_manager": {
        "properties": _crud(True),
        "units": _crud(True),
        "tenants": _crud(True),
        "leases": _crud(True),
        "employees": {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "reports": {"create": True, "read": True, "update": False, "delete": False, "approve": False, "assign": False, "generate": True, **{a: False for a in _ACTIONS[7:]}},
        "analytics": {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "billing": _crud(True),
        "documents": _crud(True),
        "vendors": _crud(True),
        "maintenance": {"create": True, "read": True, "update": True, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "work_orders": {"create": True, "read": True, "update": True, "delete": False, "approve": True, "assign": True, **{a: False for a in _ACTIONS[6:]}},
        "inventory": {"create": True, "read": True, "update": True, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "messages": _crud(True),
        "admin": {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "audit": {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
    },
    "tenant": {
        "leases": {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "maintenance": {"create": True, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "messages": {"create": True, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
        "billing": {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}},
    },
    "auditor": {m: {"create": False, "read": True, "update": False, "delete": False, **{a: False for a in _ACTIONS[4:]}} for m in _MODULES},
}


class PermissionRegistry:
    def get_default_permissions(self, role_name: str) -> dict[str, dict[str, bool]]:
        if role_name in _DEFAULT_ROLES:
            return _DEFAULT_ROLES[role_name]
        return _default_permission_structure()

    @staticmethod
    def check_permission(permissions: dict[str, dict[str, bool]], module: str, action: str) -> bool:
        module_perms = permissions.get(module)
        if module_perms is None:
            return False
        return bool(module_perms.get(action, False))
