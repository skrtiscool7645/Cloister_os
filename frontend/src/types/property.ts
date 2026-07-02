import type { UnitStatus, PropertyType } from '../lib/constants'
import type { PaginatedResponse } from './api'

export interface Property {
  id: string
  name: string
  type: PropertyType
  address: Address
  description?: string
  totalUnits: number
  images: string[]
  amenities: string[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Address {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export interface PropertyCreate {
  name: string
  type: PropertyType
  address: Address
  description?: string
  totalUnits?: number
  images?: string[]
  amenities?: string[]
}

export interface PropertyUpdate extends Partial<PropertyCreate> {
  status?: 'active' | 'inactive'
}

export interface Unit {
  id: string
  propertyId: string
  unitNumber: string
  bedrooms: number
  bathrooms: number
  squareFeet?: number
  rent: number
  deposit?: number
  status: UnitStatus
  images: string[]
  createdAt: string
  updatedAt: string
}

export interface PropertyListResponse {
  properties: Property[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type PropertyListParams = PaginatedResponse<Property> & {
  search?: string
  type?: PropertyType
  status?: 'active' | 'inactive'
}
