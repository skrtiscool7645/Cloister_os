import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '@/api/client'
import { usePermissions } from '@/hooks/usePermissions'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'

interface Property {
  id: string
  name: string
  address: string
  manager_name?: string
  manager_id?: string
}

interface Manager {
  id: string
  full_name: string
  role: string
}

export default function PropertyListPage() {
  const navigate = useNavigate()
  const { canManage } = usePermissions()
  const [properties, setProperties] = useState<Property[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', address: '', manager_id: '' })

  const fetchData = async () => {
    try {
      const [pRes, mRes] = await Promise.all([
        api.get<Property[]>('/v1/properties'),
        api.get<Manager[]>('/v1/users'),
      ])
      setProperties(pRes.data)
      setManagers(mRes.data.filter((m) => m.role !== 'TENANT'))
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { ...form }
      if (!payload.manager_id) delete (payload as Record<string, string>).manager_id
      await api.post('/v1/properties', payload)
      toast.success(`Added ${form.name}`)
      setForm({ name: '', address: '', manager_id: '' })
      setShowForm(false)
      fetchData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add property')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = useMemo(() => {
    if (!search) return properties
    const q = search.toLowerCase()
    return properties.filter(
      (p) => p.name?.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q),
    )
  }, [properties, search])

  const subtitle = `${properties.length} propert${properties.length !== 1 ? 'ies' : 'y'}`

  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Properties"
        subtitle={subtitle}
        actions={
          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
            />
            {canManage() && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                + Add Property
              </button>
            )}
          </div>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">New Property</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Property Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. Sunset Apartments"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. 123 Main St, Springfield, IL"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Manager (optional)</label>
              <select
                value={form.manager_id}
                onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">No manager</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Adding...' : 'Add Property'}
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
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState
            title="No properties found"
            description={search ? 'Try a different search term.' : 'Get started by adding your first property.'}
          />
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/properties/${p.id}`)}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{p.address}</p>
                </div>
                {p.manager_name && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                    {p.manager_name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
