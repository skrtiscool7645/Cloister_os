export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  phone?: string
  avatarUrl?: string
  isActive: boolean
  roles: Role[]
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

export interface Permission {
  id: string
  module: string
  action: string
  description?: string
}
