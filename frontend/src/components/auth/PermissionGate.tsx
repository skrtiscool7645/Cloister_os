import { type ReactNode } from 'react'

interface Permission {
  module: string
  action: 'create' | 'read' | 'update' | 'delete' | 'manage'
}

interface PermissionGateProps {
  module: string
  action: 'create' | 'read' | 'update' | 'delete' | 'manage'
  userPermissions?: Permission[]
  userRole?: string
  children: ReactNode
  fallback?: ReactNode
}

const ADMIN_ROLES = ['HEAD_ADMIN', 'ADMIN']

function hasPermission(
  module: string,
  action: string,
  permissions?: Permission[],
  role?: string,
): boolean {
  if (role && ADMIN_ROLES.includes(role)) return true
  if (!permissions) return false
  return permissions.some((p) => p.module === module && p.action === action)
}

export function PermissionGate({
  module,
  action,
  userPermissions,
  userRole,
  children,
  fallback = null,
}: PermissionGateProps) {
  if (hasPermission(module, action, userPermissions, userRole)) {
    return <>{children}</>
  }
  return <>{fallback}</>
}
