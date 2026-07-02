import client from './client'
import type { Property, PropertyCreate, PropertyUpdate, PropertyListResponse } from '../types/property'

export async function getProperties(params?: Record<string, unknown>): Promise<PropertyListResponse> {
  const response = await client.get<PropertyListResponse>('/properties', { params })
  return response.data
}

export async function getProperty(id: string): Promise<Property> {
  const response = await client.get<Property>(`/properties/${id}`)
  return response.data
}

export async function createProperty(data: PropertyCreate): Promise<Property> {
  const response = await client.post<Property>('/properties', data)
  return response.data
}

export async function updateProperty(id: string, data: PropertyUpdate): Promise<Property> {
  const response = await client.put<Property>(`/properties/${id}`, data)
  return response.data
}

export async function deleteProperty(id: string): Promise<void> {
  await client.delete(`/properties/${id}`)
}
