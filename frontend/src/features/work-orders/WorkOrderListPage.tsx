import { useState, useEffect, useMemo } from 'react'
import api from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import WorkOrderDetailModal from './WorkOrderDetailModal'

interface WorkOrder {
  id: string
  title: string
  description?: string
  priority: string
  status: string
  property_name?: string
  property_id?: string
  unit_number?: string
  assigned_to_name?: string
  assigned_to?: string
  scheduled_date?: string
  completed_date?: string
  created_at: string
  updated_at: string
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
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
const PRIORITY_OPTIONS = ['', 'LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']

export default function WorkOrderListPage() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [employees, setEmployees] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const userRole = user?.roles?.[0]?.name
  const canManage = userRole === 'HEAD_ADMIN' || userRole === 'ADMIN'

  const fetchData = async () => {
    try {
      const params: Record<string, string> = {}
      if (statusFilter) params.status = statusFilter
      if (priorityFilter) params.priority = priorityFilter
      if (assigneeFilter) params.assigned_to = assigneeFilter
      const [wRes, uRes] = await Promise.all([
        api.get<WorkOrder[]>('/api/v1/work-orders', { params }),
        api.get<User[]>('/api/users'),
      ])
      setOrders(wRes.data)
      setEmployees(uRes.data.filter((u) => u.role === 'WORKER' || u.role === 'MANAGER' || u.role === 'ADMIN'))
    } catch {
      toast.error('Failed to load work orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [statusFilter, priorityFilter, assigneeFilter])

  const filtered = useMemo(() => {
    if (!search) return orders
    const q = search.toLowerCase()
    return orders.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        (o.property_name || '').toLowerCase().includes(q) ||
        (o.assigned_to_name || '').toLowerCase().includes(q),
    )
  }, [orders, search])

  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Work Orders"
        subtitle={`${orders.length} order${orders.length !== 1 ? 's' : ''}`}
        actions={
          <div className="flex flex-wrap gap-3 items-center">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.slice(1).map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">All Priorities</option>
              {PRIORITY_OPTIONS.slice(1).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">All Employees</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.full_name}</option>
              ))}
            </select>
            <input type="text" placeholder="Search orders..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48" />
          </div>
        }
      />

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState
            title="No work orders found"
            description={search || statusFilter || priorityFilter || assigneeFilter ? 'Try adjusting your filters.' : 'No work orders have been created yet.'}
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
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Assigned To</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Scheduled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((order) => (
                  <tr key={order.id} onClick={() => setSelectedOrder(order)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{order.title}</td>
                    <td className="px-5 py-3.5 text-gray-700">{order.property_name || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn('text-xs px-2 py-1 rounded font-medium', PRIORITY_COLORS[order.priority] || 'bg-gray-100 text-gray-700')}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn('text-xs px-2 py-1 rounded font-medium', STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700')}>
                        {order.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{order.assigned_to_name || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-700">
                      {order.scheduled_date ? new Date(order.scheduled_date).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedOrder && (
        <WorkOrderDetailModal
          workOrder={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdated={(updated) => setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))}
        />
      )}
    </div>
  )
}
