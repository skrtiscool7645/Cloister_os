export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'] as const
export type Priority = (typeof PRIORITIES)[number]

export const MAINTENANCE_STATUSES = [
  'PENDING',
  'APPROVED',
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING_PARTS',
  'COMPLETED',
  'CLOSED',
] as const
export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number]

export const UNIT_STATUSES = ['vacant', 'occupied', 'maintenance', 'reserved'] as const
export type UnitStatus = (typeof UNIT_STATUSES)[number]

export const LEASE_STATUSES = ['active', 'expired', 'terminated', 'renewed'] as const
export type LeaseStatus = (typeof LEASE_STATUSES)[number]

export const PROPERTY_TYPES = ['residential', 'commercial', 'mixed'] as const
export type PropertyType = (typeof PROPERTY_TYPES)[number]

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  EMERGENCY: 'bg-red-100 text-red-700',
}

export const MAINTENANCE_STATUS_COLORS: Record<MaintenanceStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  ASSIGNED: 'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-cyan-100 text-cyan-700',
  WAITING_PARTS: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-700',
}

export const UNIT_STATUS_COLORS: Record<UnitStatus, string> = {
  vacant: 'bg-green-100 text-green-700',
  occupied: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
  reserved: 'bg-purple-100 text-purple-700',
}

export const LEASE_STATUS_COLORS: Record<LeaseStatus, string> = {
  active: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  terminated: 'bg-gray-100 text-gray-700',
  renewed: 'bg-blue-100 text-blue-700',
}
