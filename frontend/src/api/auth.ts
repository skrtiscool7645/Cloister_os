import client from './client'
import type { LoginRequest, LoginResponse } from '../types/api'
import type { User } from '../types/auth'

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await client.post<LoginResponse>('/auth/login', data)
  return response.data
}

export async function refreshToken(token: string): Promise<{ access_token: string }> {
  const response = await client.post<{ access_token: string }>('/auth/refresh', { refresh_token: token })
  return response.data
}

export async function getProfile(): Promise<User> {
  const response = await client.get<User>('/auth/profile')
  return response.data
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  const response = await client.put<User>('/auth/profile', data)
  return response.data
}
