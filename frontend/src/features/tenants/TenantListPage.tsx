import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '@/api/client'
import { usePermissions } from '@/hooks/usePermissions'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'

interface Tenant {
  id: string
  full_name: string
  email: string
  phone: string
  unit_label: string
  property_name: string
  lease_status: string
}

interface TenantForm {
  full_name: string
  email: string
  phone: string
}

const LEASE_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  terminated: 'bg-gray-100 text-gray-700',
}

function StatusBadge({ status }: { status: string }) {
  const color = LEASE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${color}`}>
      {status}
    </span>
  )
}

export default function TenantListPage() {
  const navigate = useNavigate()
  const { canManage, hasPermission } = usePermissions()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<TenantForm>({ full_name: '', email: '', phone: '' })

  const fetchData = async () => {
    try {
      const res = await api.get<Tenant[]>('/v1/tenants')
      setTenants(res.data)
    } catch {
      toast.error('Failed to load tenants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/v1/tenants', form)
      toast.success(`Added ${form.full_name}`)
      setForm({ full_name: '', email: '', phone: '' })
      setShowForm(false)
      fetchData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add tenant')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = useMemo(() => {
    if (!search) return tenants
    const q = search.toLowerCase()
    return tenants.filter(
      (t) =>
        t.full_name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.phone.toLowerCase().includes(q),
    )
  }, [tenants, search])

  const canAdd = canManage() || hasPermission('tenants', 'create')

  const subtitle = `${tenants.length} tenant${tenants.length !== 1 ? 's' : ''}`

  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Tenants"
        subtitle={subtitle}
        actions={
          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-56"
            />
            {canAdd && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                + Add Tenant
              </button>
            )}
          </div>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">New Tenant</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. john@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. +1 (555) 123-4567"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Adding...' : 'Add Tenant'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded" />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState
            title="No tenants found"
            description={search ? 'Try a different search term.' : 'No tenants have been added yet.'}
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
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Phone</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Unit</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Lease Status</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((tenant) => (
                  <tr
                    key={tenant.id}
                    onClick={() => navigate(`/tenants/${tenant.id}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-medium text-gray-900">{tenant.full_name}</td>
                    <td className="px-5 py-3.5 text-gray-700">{tenant.email}</td>
                    <td className="px-5 py-3.5 text-gray-700">{tenant.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-700">
                      {tenant.unit_label ? `${tenant.unit_label} · ${tenant.property_name}` : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {tenant.lease_status ? <StatusBadge status={tenant.lease_status} /> : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/tenants/${tenant.id}`) }}
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
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
    </div>
  )
}
