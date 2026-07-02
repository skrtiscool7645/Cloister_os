import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { LoadingScreen } from '@/components/feedback/LoadingState'

interface ProtectedRouteProps {
  children: ReactNode
  isAuthenticated?: boolean
  isLoading?: boolean
  requiredRole?: string | string[]
  userRole?: string
  fallbackPath?: string
  renderUnauthorized?: ReactNode
}

export function ProtectedRoute({
  children,
  isAuthenticated,
  isLoading,
  requiredRole,
  userRole,
  fallbackPath = '/login',
  renderUnauthorized,
}: ProtectedRouteProps) {
  if (isLoading) return <LoadingScreen />

  // In development, allow anonymous access so the app can be explored without login.
  if (!isAuthenticated) {
    // Vite exposes `import.meta.env.DEV` during dev runs
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (import.meta.env && (import.meta.env.DEV as boolean)) return <>{children}</>
    return <Navigate to={fallbackPath} replace />
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!userRole || !roles.includes(userRole)) {
      if (renderUnauthorized) return <>{renderUnauthorized}</>
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
