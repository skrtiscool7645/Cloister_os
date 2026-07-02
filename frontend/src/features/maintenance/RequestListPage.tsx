import { useState, useEffect, useMemo } from 'react'
import api from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import RequestDetailModal from './RequestDetailModal'

interface MaintenanceRequest {
  id: string
  title: string
  description?: string
  priority: string
  status: string
  property_name?: string
  property_id?: string
  unit_number?: string
  created_by_name?: string
  assigned_to_name?: string
  assigned_to?: string
  created_at: string
  updated_at: string
}

interface Property {
  id: string
  name: string
}

interface User {
  id: string
  full_name: string
  role: string
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

const PRIORITY_OPTIONS = ['', 'LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']
const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'CLOSED']

export default function RequestListPage() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [propertyFilter, setPropertyFilter] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', property_id: '', unit_number: '' })
  const [submitting, setSubmitting] = useState(false)
  const userRole = user?.roles?.[0]?.name
  const canManage = userRole === 'HEAD_ADMIN' || userRole === 'ADMIN'

  const fetchData = async () => {
    try {
      const params: Record<string, string> = {}
      if (statusFilter) params.status = statusFilter
      if (priorityFilter) params.priority = priorityFilter
      if (propertyFilter) params.property_id = propertyFilter
      const [rRes, pRes] = await Promise.all([
        api.get<MaintenanceRequest[]>('/api/v1/maintenance-requests', { params }),
        api.get<Property[]>('/v1/properties'),
      ])
      setRequests(rRes.data)
      setProperties(pRes.data)
      if (canManage) {
        const uRes = await api.get<User[]>('/api/users')
        setUsers(uRes.data)
      }
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [statusFilter, priorityFilter, propertyFilter])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSubmitting(true)
    try {
      const res = await api.post('/api/v1/maintenance-requests', form)
      setRequests((prev) => [res.data, ...prev])
      toast.success('Request created')
      setShowCreate(false)
      setForm({ title: '', description: '', priority: 'MEDIUM', property_id: '', unit_number: '' })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create request')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = useMemo(() => {
    if (!search) return requests
    const q = search.toLowerCase()
    return requests.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.property_name || '').toLowerCase().includes(q) ||
        (r.assigned_to_name || '').toLowerCase().includes(q),
    )
  }, [requests, search])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this request?')) return
    try {
      await api.delete(`/api/v1/maintenance-requests/${id}`)
      setRequests((prev) => prev.filter((r) => r.id !== id))
      setSelectedRequest(null)
      toast.success('Request deleted')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Maintenance Requests"
        subtitle={`${requests.length} request${requests.length !== 1 ? 's' : ''}`}
        actions={
          <div className="flex flex-wrap gap-3 items-center">
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">All Priorities</option>
              {PRIORITY_OPTIONS.slice(1).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.slice(1).map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <select value={propertyFilter} onChange={(e) => setPropertyFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input type="text" placeholder="Search requests..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48" />
            {!showCreate && (
              <button onClick={() => setShowCreate(true)}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                + New Request
              </button>
            )}
          </div>
        }
      />

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">New Request</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
              <input type="text" required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. Leaking faucet" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={3} placeholder="Describe the issue..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
              <select value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="EMERGENCY">EMERGENCY</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Unit Number</label>
              <input type="text" value={form.unit_number}
                onChange={(e) => setForm({ ...form, unit_number: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. 3A" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Property</label>
              <select value={form.property_id}
                onChange={(e) => setForm({ ...form, property_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Select property...</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {submitting ? 'Creating...' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState
            title="No requests found"
            description={search || statusFilter || priorityFilter || propertyFilter ? 'Try adjusting your filters.' : 'Create your first maintenance request.'}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Title</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Property</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Priority</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Created</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((req) => (
                  <tr key={req.id} onClick={() => setSelectedRequest(req)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{req.title}</td>
                    <td className="px-5 py-3.5 text-gray-700">{req.property_name || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn('text-xs px-2 py-1 rounded font-medium', PRIORITY_COLORS[req.priority] || 'bg-gray-100 text-gray-700')}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn('text-xs px-2 py-1 rounded font-medium', STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-700')}>
                        {req.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{new Date(req.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedRequest(req) }}
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdated={(updated) => setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
