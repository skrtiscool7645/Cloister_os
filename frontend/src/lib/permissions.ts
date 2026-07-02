import type { User, Role } from '../types/auth'

export function hasPermission(user: User | null, module: string, action: string): boolean {
  if (!user) return false
  return user.roles.some((role) =>
    role.permissions.some(
      (permission) => permission.module === module && permission.action === action,
    ),
  )
}

export function hasRole(user: User | null, role: string): boolean {
  if (!user) return false
  return user.roles.some((r) => r.name === role)
}

export function canManage(user: User | null): boolean {
  if (!user) return false
  return user.roles.some((r) => r.name === 'HEAD_ADMIN' || r.name === 'ADMIN')
}
