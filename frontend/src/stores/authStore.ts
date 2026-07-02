import { create } from 'zustand'
import type { User } from '../types/auth'
import { setAccessToken } from '../api/client'

interface AuthState {
  user: User | null
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

function hydrateToken(): string | null {
  const token = localStorage.getItem('access_token')
  if (token) {
    setAccessToken(token)
  }
  return token
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: hydrateToken(),
  setUser: (user) => set({ user }),
  setToken: (token) => {
    setAccessToken(token)
    if (token) {
      localStorage.setItem('access_token', token)
    } else {
      localStorage.removeItem('access_token')
    }
    set({ token })
  },
  logout: () => {
    setAccessToken(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, token: null })
  },
}))
