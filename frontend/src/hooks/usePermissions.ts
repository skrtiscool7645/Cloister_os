import { useMemo } from 'react'
import { useAuthStore } from '../stores/authStore'
import { hasPermission, hasRole, canManage } from '../lib/permissions'

export function usePermissions() {
  const user = useAuthStore((state) => state.user)

  return useMemo(
    () => ({
      hasPermission: (module: string, action: string) => hasPermission(user, module, action),
      hasRole: (role: string) => hasRole(user, role),
      canManage: () => canManage(user),
      user,
    }),
    [user],
  )
}
