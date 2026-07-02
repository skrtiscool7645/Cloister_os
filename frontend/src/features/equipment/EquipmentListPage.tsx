import { useState, useEffect, useMemo } from 'react'
import api from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Equipment {
  id: string
  name: string
  category: string
  make?: string
  model?: string
  serial_number?: string
  status: string
  location?: string
  assigned_to_name?: string
  purchase_date?: string
  last_maintenance_date?: string
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  in_use: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
  retired: 'bg-gray-100 text-gray-700',
}

const CATEGORIES = ['', 'HVAC', 'Electrical', 'Plumbing', 'Vehicle', 'Tool', 'Safety', 'Other']

export default function EquipmentListPage() {
  const { user } = useAuthStore()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', category: '', make: '', model: '', serial_number: '', status: 'available', location: '' })
  const userRole = user?.roles?.[0]?.name
  const canManage = userRole === 'HEAD_ADMIN' || userRole === 'ADMIN'

  const fetchData = async () => {
    try {
      const params: Record<string, string> = {}
      if (categoryFilter) params.category = categoryFilter
      const res = await api.get<Equipment[]>('/api/v1/equipment', { params })
      setEquipment(res.data)
    } catch {
      toast.error('Failed to load equipment')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [categoryFilter])

  const filtered = useMemo(() => {
    if (!search) return equipment
    const q = search.toLowerCase()
    return equipment.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.make || '').toLowerCase().includes(q) ||
        (e.model || '').toLowerCase().includes(q),
    )
  }, [equipment, search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSubmitting(true)
    try {
      await api.post('/api/v1/equipment', form)
      toast.success(`Added ${form.name}`)
      setForm({ name: '', category: '', make: '', model: '', serial_number: '', status: 'available', location: '' })
      setShowForm(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add equipment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Equipment"
        subtitle={`${equipment.length} item${equipment.length !== 1 ? 's' : ''}`}
        actions={
          <div className="flex flex-wrap gap-3 items-center">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">All Categories</option>
              {CATEGORIES.slice(1).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input type="text" placeholder="Search equipment..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48" />
            {canManage && !showForm && (
              <button onClick={() => setShowForm(true)}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                + Add Equipment
              </button>
            )}
          </div>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">New Equipment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Select...</option>
                {CATEGORIES.slice(1).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Make</label>
              <input type="text" value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Model</label>
              <input type="text" value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Serial Number</label>
              <input type="text" value={form.serial_number}
                onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <input type="text" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {submitting ? 'Adding...' : 'Add Equipment'}
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
            title="No equipment found"
            description={search || categoryFilter ? 'Try adjusting your filters.' : 'No equipment has been added yet.'}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Make/Model</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Location</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Assigned To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((eq) => (
                  <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{eq.name}</td>
                    <td className="px-5 py-3.5 text-gray-700">{eq.category || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-700">
                      {eq.make && eq.model ? `${eq.make} ${eq.model}` : eq.make || eq.model || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn('text-xs px-2 py-1 rounded font-medium', STATUS_COLORS[eq.status] || 'bg-gray-100 text-gray-700')}>
                        {eq.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{eq.location || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-700">{eq.assigned_to_name || '—'}</td>
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
