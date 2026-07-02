import { useCallback } from 'react'
import { useAuthStore } from '../stores/authStore'
import { login as apiLogin } from '../api/auth'
import type { LoginRequest } from '../types/api'

export function useAuth() {
  const { user, token, setUser, setToken, logout: storeLogout } = useAuthStore()

  const login = useCallback(
    async (data: LoginRequest) => {
      const response = await apiLogin(data)
      setToken(response.access_token)
      return response
    },
    [setToken],
  )

  const logout = useCallback(() => {
    storeLogout()
  }, [storeLogout])

  return {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    setUser,
  }
}
