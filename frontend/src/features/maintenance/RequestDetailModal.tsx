import { useState, useEffect } from 'react'
import api from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Photo {
  id: string
  url: string
  photo_type: string
}

interface User {
  id: string
  full_name: string
  email: string
  role: string
}

interface MaintenanceRequest {
  id: string
  title: string
  description?: string
  priority: string
  status: string
  property_name?: string
  property_id?: string
  unit_number?: string
  unit_id?: string
  created_by_name?: string
  assigned_to_name?: string
  assigned_to?: string
  created_at: string
  updated_at: string
  photos?: Photo[]
}

interface RequestDetailModalProps {
  request: MaintenanceRequest
  onClose: () => void
  onUpdated: (updated: MaintenanceRequest) => void
  onDelete: (id: string) => void
}

const PRIORITY_COLORS: Record<string, string> = {
  EMERGENCY: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-blue-100 text-blue-700',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  ASSIGNED: 'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  WAITING_PARTS: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CLOSED: 'text-gray-600 bg-gray-200',
}

const STATUSES = ['PENDING', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'CLOSED']

export default function RequestDetailModal({ request, onClose, onUpdated, onDelete }: RequestDetailModalProps) {
  const { user } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [assignId, setAssignId] = useState(request.assigned_to || '')
  const [submitting, setSubmitting] = useState(false)
  const [photos, setPhotos] = useState<Photo[]>(request.photos || [])
  const userRole = user?.roles?.[0]?.name
  const canManage = userRole === 'HEAD_ADMIN' || userRole === 'ADMIN'
  const canDelete = canManage

  useEffect(() => {
    if (canManage) {
      api.get('/api/users').then((r) => setUsers(r.data)).catch(() => {})
    }
  }, [canManage])

  useEffect(() => {
    api.get(`/api/v1/maintenance-requests/${request.id}`)
      .then((r) => setPhotos(r.data.photos || []))
      .catch(() => {})
  }, [request.id])

  const handleAssign = async () => {
    if (!assignId) return
    setSubmitting(true)
    try {
      const res = await api.patch(`/api/v1/maintenance-requests/${request.id}/assign`, { assigned_to: assignId })
      onUpdated(res.data)
      toast.success('Request assigned')
    } catch {
      toast.error('Failed to assign')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    setSubmitting(true)
    try {
      const res = await api.patch(`/api/v1/maintenance-requests/${request.id}/status`, { status })
      onUpdated(res.data)
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">{request.title}</h2>
          <div className="flex gap-2">
            {canDelete && (
              <button onClick={() => onDelete(request.id)}
                className="text-xs text-red-600 hover:text-red-800 px-2 py-1 border border-red-300 rounded">
                Delete
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <span className="text-xs text-gray-500 block">Description</span>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.description || 'No description'}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-xs text-gray-500 block">Priority</span>
              <span className={cn('text-xs px-2 py-1 rounded font-medium', PRIORITY_COLORS[request.priority] || 'bg-gray-100 text-gray-700')}>
                {request.priority}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Status</span>
              <span className={cn('text-xs px-2 py-1 rounded font-medium', STATUS_COLORS[request.status] || 'bg-gray-100 text-gray-700')}>
                {request.status?.replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Created</span>
              <span className="text-gray-600">{new Date(request.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="text-sm">
            <span className="text-xs text-gray-500 block">Location</span>
            <span>{request.property_name}{request.unit_number ? ` - Unit ${request.unit_number}` : ''}</span>
          </div>

          {request.created_by_name && (
            <div className="text-sm">
              <span className="text-xs text-gray-500 block">Reported By</span>
              <span className="text-gray-700">{request.created_by_name}</span>
            </div>
          )}

          {request.assigned_to_name && (
            <div className="text-sm">
              <span className="text-xs text-gray-500 block">Assigned To</span>
              <span className="text-gray-700">{request.assigned_to_name}</span>
            </div>
          )}

          {photos.length > 0 && (
            <div>
              <span className="text-xs text-gray-500 block">Photos</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {photos.map((p, i) => (
                  <a key={p.id || i} href={p.url} target="_blank" rel="noreferrer">
                    <img src={p.url} alt={`Photo ${i + 1}`} className="w-20 h-20 object-cover rounded border" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {canManage && (
            <>
              <div className="border-t pt-4">
                <label className="text-xs font-medium text-gray-500 block mb-1">Assign To</label>
                <div className="flex gap-2">
                  <select value={assignId} onChange={(e) => setAssignId(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm">
                    <option value="">Select worker...</option>
                    {users.filter((u) => u.role === 'WORKER').map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                    ))}
                  </select>
                  <button onClick={handleAssign} disabled={!assignId || submitting}
                    className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50">
                    Assign
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="text-xs font-medium text-gray-500 block mb-1">Update Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button key={s} onClick={() => handleStatusChange(s)} disabled={submitting || s === request.status}
                      className={cn('text-xs px-3 py-1.5 rounded border transition-colors', s === request.status ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-700')}>
                      {s.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
