import { useState, useEffect, useMemo } from 'react'
import api from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface InventoryItem {
  id: string
  name: string
  sku?: string
  category: string
  quantity: number
  unit: string
  min_stock_level: number
  location?: string
  supplier?: string
  created_at: string
}

const CATEGORIES = ['', 'Plumbing', 'Electrical', 'HVAC', 'Cleaning', 'Tools', 'Safety', 'Other']

export default function InventoryListPage() {
  const { user } = useAuthStore()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', sku: '', category: '', quantity: 0, unit: 'each', min_stock_level: 0, location: '', supplier: '' })
  const userRole = user?.roles?.[0]?.name
  const canManage = userRole === 'HEAD_ADMIN' || userRole === 'ADMIN'

  const fetchData = async () => {
    try {
      const params: Record<string, string> = {}
      if (categoryFilter) params.category = categoryFilter
      if (lowStockOnly) params.low_stock = 'true'
      const res = await api.get<InventoryItem[]>('/api/v1/inventory', { params })
      setItems(res.data)
    } catch {
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [categoryFilter, lowStockOnly])

  const filtered = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter(
      (i) => i.name.toLowerCase().includes(q) || (i.sku || '').toLowerCase().includes(q),
    )
  }, [items, search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/v1/inventory', form)
      toast.success(`Added ${form.name}`)
      setForm({ name: '', sku: '', category: '', quantity: 0, unit: 'each', min_stock_level: 0, location: '', supplier: '' })
      setShowForm(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add item')
    } finally {
      setSubmitting(false)
    }
  }

  const lowStockCount = items.filter((i) => i.quantity <= i.min_stock_level).length
  const subtitle = `${items.length} item${items.length !== 1 ? 's' : ''}${lowStockCount > 0 ? ` · ${lowStockCount} low stock` : ''}`

  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Inventory"
        subtitle={subtitle}
        actions={
          <div className="flex flex-wrap gap-3 items-center">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">All Categories</option>
              {CATEGORIES.slice(1).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              Low stock only
            </label>
            <input type="text" placeholder="Search by name or SKU..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48" />
            {canManage && !showForm && (
              <button onClick={() => setShowForm(true)}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                + Add Item
              </button>
            )}
          </div>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">New Inventory Item</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">SKU</label>
              <input type="text" value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
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
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
              <input type="number" required min={0} value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
              <input type="text" value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min Stock Level</label>
              <input type="number" required min={0} value={form.min_stock_level}
                onChange={(e) => setForm({ ...form, min_stock_level: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <input type="text" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Supplier</label>
              <input type="text" value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {submitting ? 'Adding...' : 'Add Item'}
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
            title="No inventory items found"
            description={search || categoryFilter || lowStockOnly ? 'Try adjusting your filters.' : 'Add your first inventory item.'}
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
                  <th className="text-right px-5 py-3 font-medium text-gray-600">Qty</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Unit</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600">Min Stock</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Location</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => {
                  const isLowStock = item.quantity <= item.min_stock_level
                  return (
                    <tr key={item.id} className={cn('transition-colors hover:bg-gray-50', isLowStock && 'bg-red-50')}>
                      <td className="px-5 py-3.5">
                        <div>
                          <span className="font-medium text-gray-900">{item.name}</span>
                          {item.sku && <span className="text-xs text-gray-400 ml-2">{item.sku}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">{item.category || '—'}</td>
                      <td className={cn('px-5 py-3.5 text-right font-medium', isLowStock ? 'text-red-600' : 'text-gray-700')}>
                        {item.quantity}
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">{item.unit}</td>
                      <td className="px-5 py-3.5 text-right text-gray-700">{item.min_stock_level}</td>
                      <td className="px-5 py-3.5 text-gray-700">{item.location || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-700">{item.supplier || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
