import { useState, useEffect, useMemo } from 'react'
import api from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Vendor {
  id: string
  company_name: string
  contact_name?: string
  email?: string
  phone?: string
  address?: string
  status: string
  notes?: string
  created_at: string
}

interface Contract {
  id: string
  title: string
  start_date: string
  end_date: string
  value: number
  status: string
}

interface WorkOrder {
  id: string
  title: string
  status: string
  created_at: string
}

export default function VendorListPage() {
  const { user } = useAuthStore()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [vendorDetailLoading, setVendorDetailLoading] = useState(false)
  const [form, setForm] = useState({ company_name: '', contact_name: '', email: '', phone: '', address: '', notes: '' })
  const userRole = user?.roles?.[0]?.name
  const canManage = userRole === 'HEAD_ADMIN' || userRole === 'ADMIN'

  const fetchData = async () => {
    try {
      const res = await api.get<Vendor[]>('/api/v1/vendors')
      setVendors(res.data)
    } catch {
      toast.error('Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.company_name.trim()) return
    setSubmitting(true)
    try {
      await api.post('/api/v1/vendors', form)
      toast.success(`Added ${form.company_name}`)
      setForm({ company_name: '', contact_name: '', email: '', phone: '', address: '', notes: '' })
      setShowForm(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add vendor')
    } finally {
      setSubmitting(false)
    }
  }

  const openDetail = async (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setVendorDetailLoading(true)
    try {
      const [cRes, wRes] = await Promise.all([
        api.get<Contract[]>(`/api/v1/vendors/${vendor.id}/contracts`),
        api.get<WorkOrder[]>(`/api/v1/vendors/${vendor.id}/work-orders`),
      ])
      setContracts(cRes.data)
      setWorkOrders(wRes.data)
    } catch {
      toast.error('Failed to load vendor details')
    } finally {
      setVendorDetailLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (!search) return vendors
    const q = search.toLowerCase()
    return vendors.filter(
      (v) =>
        v.company_name.toLowerCase().includes(q) ||
        (v.contact_name || '').toLowerCase().includes(q) ||
        (v.email || '').toLowerCase().includes(q),
    )
  }, [vendors, search])

  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Vendors"
        subtitle={`${vendors.length} vendor${vendors.length !== 1 ? 's' : ''}`}
        actions={
          <div className="flex gap-3 items-center">
            <input type="text" placeholder="Search vendors..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48" />
            {canManage && !showForm && (
              <button onClick={() => setShowForm(true)}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                + Add Vendor
              </button>
            )}
          </div>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">New Vendor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Company Name *</label>
              <input type="text" required value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contact Name</label>
              <input type="text" value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input type="tel" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
              <input type="text" value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" rows={2} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {submitting ? 'Adding...' : 'Add Vendor'}
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
            title="No vendors found"
            description={search ? 'Try a different search term.' : 'Add your first vendor.'}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Company Name</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Contact</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Phone</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{v.company_name}</td>
                    <td className="px-5 py-3.5 text-gray-700">{v.contact_name || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-700">{v.email || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-700">{v.phone || '—'}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => openDetail(v)}
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

      {selectedVendor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedVendor(null)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">{selectedVendor.company_name}</h2>
              <button onClick={() => setSelectedVendor(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-gray-500 block">Contact</span>
                  <span className="text-gray-700">{selectedVendor.contact_name || '—'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Email</span>
                  <span className="text-gray-700">{selectedVendor.email || '—'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Phone</span>
                  <span className="text-gray-700">{selectedVendor.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Status</span>
                  <span className="text-gray-700 capitalize">{selectedVendor.status || 'active'}</span>
                </div>
              </div>
              {selectedVendor.address && (
                <div className="text-sm">
                  <span className="text-xs text-gray-500 block">Address</span>
                  <span className="text-gray-700">{selectedVendor.address}</span>
                </div>
              )}
              {selectedVendor.notes && (
                <div className="text-sm">
                  <span className="text-xs text-gray-500 block">Notes</span>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedVendor.notes}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Contracts ({contracts.length})</h3>
                {vendorDetailLoading ? (
                  <Skeleton className="h-8 rounded" />
                ) : contracts.length === 0 ? (
                  <p className="text-xs text-gray-400">No contracts.</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-1 font-medium text-gray-500">Title</th>
                        <th className="text-left py-1 font-medium text-gray-500">Value</th>
                        <th className="text-left py-1 font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {contracts.map((c) => (
                        <tr key={c.id}>
                          <td className="py-1 text-gray-700">{c.title}</td>
                          <td className="py-1 text-gray-700">${c.value.toLocaleString()}</td>
                          <td className="py-1">
                            <span className={cn('px-1.5 py-0.5 rounded font-medium', c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Work Orders ({workOrders.length})</h3>
                {vendorDetailLoading ? (
                  <Skeleton className="h-8 rounded" />
                ) : workOrders.length === 0 ? (
                  <p className="text-xs text-gray-400">No work orders.</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-1 font-medium text-gray-500">Title</th>
                        <th className="text-left py-1 font-medium text-gray-500">Status</th>
                        <th className="text-left py-1 font-medium text-gray-500">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {workOrders.map((wo) => (
                        <tr key={wo.id}>
                          <td className="py-1 text-gray-700">{wo.title}</td>
                          <td className="py-1">{wo.status}</td>
                          <td className="py-1 text-gray-500">{new Date(wo.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
