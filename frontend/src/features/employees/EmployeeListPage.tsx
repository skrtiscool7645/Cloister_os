import { useState, useEffect, useMemo } from 'react'
import api from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Employee {
  id: string
  full_name: string
  email: string
  phone?: string
  role: string
  is_active: boolean
  created_at: string
}

const ROLE_COLORS: Record<string, string> = {
  HEAD_ADMIN: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-red-100 text-red-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  WORKER: 'bg-green-100 text-green-700',
  TENANT: 'bg-gray-100 text-gray-700',
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function EmployeeListPage() {
  const { user } = useAuthStore()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'WORKER' })
  const userRole = user?.roles?.[0]?.name
  const isAdmin = userRole === 'HEAD_ADMIN' || userRole === 'ADMIN'

  const fetchData = async () => {
    try {
      const res = await api.get<Employee[]>('/api/users')
      setEmployees(res.data.filter((e) => e.role !== 'TENANT'))
    } catch {
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/users/register', form)
      toast.success(`Added ${form.full_name}`)
      setForm({ full_name: '', email: '', password: '', role: 'WORKER' })
      setShowForm(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add employee')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (emp: Employee) => {
    try {
      await api.patch(`/api/users/${emp.id}`, { is_active: !emp.is_active })
      setEmployees((prev) => prev.map((e) => (e.id === emp.id ? { ...e, is_active: !e.is_active } : e)))
      toast.success(emp.is_active ? 'Employee deactivated' : 'Employee activated')
    } catch {
      toast.error('Failed to update employee')
    }
  }

  const filtered = useMemo(() => {
    if (!search) return employees
    const q = search.toLowerCase()
    return employees.filter(
      (e) => e.full_name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q),
    )
  }, [employees, search])

  const subtitle = `${employees.length} employee${employees.length !== 1 ? 's' : ''}`

  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Employees"
        subtitle={subtitle}
        actions={
          <div className="flex gap-3 items-center">
            <input type="text" placeholder="Search employees..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48" />
            {isAdmin && !showForm && (
              <button onClick={() => setShowForm(true)}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                + Add Employee
              </button>
            )}
          </div>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">New Employee</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
              <input type="text" required value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. Jane Smith" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. jane@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <input type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="WORKER">Worker</option>
                <option value="MANAGER">Manager</option>
                {userRole === 'HEAD_ADMIN' && <option value="ADMIN">Admin</option>}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {submitting ? 'Adding...' : 'Add Employee'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
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
            title="No employees found"
            description={search ? 'Try a different search term.' : 'No employees have been added yet.'}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Role</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Created</th>
                  {isAdmin && <th className="text-left px-5 py-3 font-medium text-gray-600">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={emp.full_name} />
                        <span className="font-medium text-gray-900">{emp.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{emp.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn('text-xs px-2 py-1 rounded font-medium', ROLE_COLORS[emp.role] || 'bg-gray-100 text-gray-700')}>
                        {emp.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn('text-xs px-2 py-1 rounded font-medium', emp.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{new Date(emp.created_at).toLocaleDateString()}</td>
                    {isAdmin && (
                      <td className="px-5 py-3.5">
                        <button onClick={() => handleToggleActive(emp)}
                          className={cn('text-sm transition-colors', emp.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800')}>
                          {emp.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
