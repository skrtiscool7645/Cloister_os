import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import api from '@/api/client'
import toast from 'react-hot-toast'
import KanbanBoard from './KanbanBoard'
import CreateRequestModal from './CreateRequestModal'
import RequestDetailModal from './RequestDetailModal'
import type { MaintenanceRequest } from './KanbanBoard'
import StatCard from '@/components/ui/StatCard'
import { Skeleton } from '@/components/feedback/LoadingState'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [searchText, setSearchText] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showChangePw, setShowChangePw] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null)
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' })
  const [pwSubmitting, setPwSubmitting] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const socketRef = useRef<any>(null)

  const fetchTasks = useCallback(async () => {
    try {
      const params = filter ? { status: filter } : {}
      const res = await api.get('/api/v1/maintenance-requests', { params })
      setTasks(res.data)
      setPendingCount(res.data.filter((t: MaintenanceRequest) => t.status === 'PENDING').length)
    } catch {
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    setLoading(true)
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    if ((user as any)?.force_password_change) {
      setShowChangePw(true)
      toast('Please change your password before continuing', { icon: '\u{1F512}' })
    }
  }, [user])

  useEffect(() => {
    let socket: any
    const initSocket = async () => {
      try {
        const { io } = await import('socket.io-client')
        socket = io(import.meta.env.VITE_API_URL || '', {
          transports: ['websocket', 'polling'],
        })

        socket.on('request-status-update', (updated: MaintenanceRequest) => {
          setTasks((prev) => prev.map((t) => (t.id === updated.id ? { ...t, status: updated.status } : t)))
          toast(`Request moved to ${updated.status.replace(/_/g, ' ')}`, { icon: '\u{1F504}' })
        })

        socket.on('high-priority-request', (req: MaintenanceRequest) => {
          setTasks((prev) => [req, ...prev])
          toast(`${req.priority} priority: ${req.title}`, { icon: '\u{1F534}' })
        })

        socket.on('request-deleted', (id: string) => {
          setTasks((prev) => prev.filter((t) => t.id !== id))
          toast('Request deleted', { icon: '\u{1F5D1}' })
        })
      } catch {
        // socket.io-client not available
      }
    }
    initSocket()
    return () => { socket?.disconnect() }
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwSubmitting(true)
    try {
      await api.post('/api/auth/change-password', pwForm)
      toast.success('Password changed successfully')
      setShowChangePw(false)
      setPwForm({ current_password: '', new_password: '' })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setPwSubmitting(false)
    }
  }

  const handleMoveTask = async (taskId: string, newStatus: string) => {
    const previousTasks = [...tasks]
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )
    try {
      await api.patch(`/api/v1/maintenance-requests/${taskId}/status`, { status: newStatus })
    } catch {
      setTasks(previousTasks)
      toast.error('Failed to update status')
    }
  }

  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm('Delete this request?')) return
    try {
      await api.delete(`/api/v1/maintenance-requests/${id}`)
      setTasks((prev) => prev.filter((t) => t.id !== id))
      setSelectedRequest(null)
      toast.success('Request deleted')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  const filteredTasks = tasks.filter((t) => {
    if (!searchText) return true
    const q = searchText.toLowerCase()
    return t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.property_name?.toLowerCase().includes(q) || t.assigned_to_name?.toLowerCase().includes(q)
  })

  const stats = [
    { label: 'Pending', count: filteredTasks.filter((t) => t.status === 'PENDING').length, color: 'bg-gray-500' },
    { label: 'In Progress', count: filteredTasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length, color: 'bg-yellow-500' },
    { label: 'Completed', count: filteredTasks.filter((t) => t.status === 'COMPLETED').length, color: 'bg-green-500' },
    { label: 'Total', count: filteredTasks.length, color: 'bg-blue-500' },
  ]

  return (
    <div className="flex flex-col min-w-0">
      <header className="rounded-[1.5rem] bg-white/90 p-5 shadow-card ring-1 ring-slate-200/70 backdrop-blur-xl dark:bg-slate-900/95 dark:ring-slate-800/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Welcome back</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Your operations control center</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Track requests, manage teams, and stay ahead with a polished property operations dashboard.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl bg-slate-100 px-4 py-3 shadow-sm dark:bg-slate-900">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Pending requests</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{pendingCount}</div>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
              + New Request
            </button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-2 xl:grid-cols-[1.5fr_auto]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Active issues</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{filteredTasks.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-900 p-3 text-white shadow-sm">
                <span className="text-xl font-bold">{pendingCount}</span>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/90 p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.24em] text-slate-500">{stat.label}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${stat.color}`} />
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{stat.count}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-100 p-6 shadow-card dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-200 text-slate-900 flex items-center justify-center text-xl dark:bg-slate-700 dark:text-white">⚡</div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Boost your team</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Run operations faster with clear priorities and smarter alerts.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              <button className="w-full rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">View insights</button>
              <button className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">Open analytics</button>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="col-span-2 rounded-[1.5rem] bg-white/90 p-5 shadow-card ring-1 ring-slate-200/70 dark:bg-slate-900/95 dark:ring-slate-800/60">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">A live feed of your team's most recent tasks.</p>
              </div>
              <button className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">View all</button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">No recent activity — this is a placeholder feed.</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">Activity items will appear here.</div>
            </div>
          </div>
        <div className="space-y-4">
          <div className="rounded-[1.5rem] bg-white/90 p-5 shadow-card ring-1 ring-slate-200/70 dark:bg-slate-950/90 dark:ring-slate-800/60">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming Inspections</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No upcoming inspections.</p>
            <button className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Schedule inspection</button>
          </div>

          <div className="rounded-[1.5rem] bg-white/90 p-5 shadow-card ring-1 ring-slate-200/70 dark:bg-slate-950/90 dark:ring-slate-800/60">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Maintenance Priority</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Priority chart placeholder</p>
          </div>
        </div>
      </div>

      <main className="mt-6 flex-1 overflow-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[1.5rem] bg-white/90 p-10 text-center shadow-card ring-1 ring-slate-200/70 dark:bg-slate-900/95 dark:ring-slate-800/60">
            <svg className="mx-auto mb-4 h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No requests yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Create your first maintenance request to get started.</p>
            <button onClick={() => setShowCreate(true)}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">+ New Request</button>
          </div>
        ) : (
          <KanbanBoard tasks={filteredTasks} onMoveTask={handleMoveTask} onCardClick={(task) => setSelectedRequest(task)} userRole={user?.roles?.[0]?.name} />
        )}
      </main>

      {showCreate && (
        <CreateRequestModal
          onClose={() => setShowCreate(false)}
          onCreated={(req) => {
            setTasks((prev) => [req, ...prev])
            setPendingCount((c) => c + 1)
          }}
        />
      )}

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdated={(updated) => setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))}
          onDelete={handleDeleteRequest}
        />
      )}

      {showChangePw && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" required value={pwForm.current_password}
                  onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" required value={pwForm.new_password}
                  onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                {!(user as any)?.force_password_change && (
                  <button type="button" onClick={() => setShowChangePw(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                )}
                <button type="submit" disabled={pwSubmitting}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {pwSubmitting ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
