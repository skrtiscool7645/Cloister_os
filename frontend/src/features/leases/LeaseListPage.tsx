import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import api from '@/api/client'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Lease {
  id: string
  tenant_name: string
  tenant_id: string
  unit_label: string
  property_name: string
  start_date: string
  end_date: string
  monthly_rent: number
  status: string
}

const STATUS_OPTIONS = ['all', 'active', 'expired', 'terminated'] as const

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  expired: 'bg-gray-100 text-gray-700',
  terminated: 'bg-red-100 text-red-700',
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${color}`}>
      {status}
    </span>
  )
}

export default function LeaseListPage() {
  const [leases, setLeases] = useState<Lease[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchData = async () => {
    try {
      const res = await api.get<Lease[]>('/v1/leases')
      setLeases(res.data)
    } catch {
      toast.error('Failed to load leases')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filtered = useMemo(() => {
    return leases.filter((l) => {
      if (statusFilter !== 'all' && l.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          l.tenant_name.toLowerCase().includes(q) ||
          l.unit_label.toLowerCase().includes(q) ||
          l.property_name.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [leases, search, statusFilter])

  const subtitle = `${leases.length} lease${leases.length !== 1 ? 's' : ''}`

  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Leases"
        subtitle={subtitle}
        actions={
          <div className="flex gap-3 items-center">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setStatusFilter(opt)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${
                    statusFilter === opt
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search by tenant or unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
            />
          </div>
        }
      />

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
            title="No leases found"
            description={search || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'No leases have been created yet.'}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Tenant</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Unit</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Start Date</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">End Date</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Monthly Rent</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((lease) => (
                  <tr key={lease.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{lease.tenant_name}</td>
                    <td className="px-5 py-3.5 text-gray-700">
                      {lease.unit_label} · {lease.property_name}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{formatDate(lease.start_date)}</td>
                    <td className="px-5 py-3.5 text-gray-700">{formatDate(lease.end_date)}</td>
                    <td className="px-5 py-3.5 text-gray-700">{formatCurrency(lease.monthly_rent)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={lease.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => {}}
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
