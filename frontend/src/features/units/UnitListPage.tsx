import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '@/api/client'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatCurrency } from '@/lib/utils'

interface Unit {
  id: string
  unit_label: string
  property_name: string
  property_id: string
  status: string
  bedrooms: number
  bathrooms: number
  monthly_rent: number
}

interface Property {
  id: string
  name: string
}

const STATUS_COLORS: Record<string, string> = {
  vacant: 'bg-green-100 text-green-700',
  occupied: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
  reserved: 'bg-purple-100 text-purple-700',
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${color}`}>
      {status}
    </span>
  )
}

export default function UnitListPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [propertyFilter, setPropertyFilter] = useState('')

  const fetchData = async () => {
    try {
      const [uRes, pRes] = await Promise.all([
        api.get<Unit[]>('/v1/units'),
        api.get<Property[]>('/v1/properties'),
      ])
      setUnits(uRes.data)
      setProperties(pRes.data)
    } catch {
      toast.error('Failed to load units')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filtered = units.filter((u) => {
    if (propertyFilter && u.property_id !== propertyFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        u.unit_label.toLowerCase().includes(q) ||
        u.property_name.toLowerCase().includes(q)
      )
    }
    return true
  })

  const columns: Column<Unit>[] = [
    { key: 'unit_label', header: 'Unit', sortable: true },
    { key: 'property_name', header: 'Property', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (u) => <StatusBadge status={u.status} />,
    },
    { key: 'bedrooms', header: 'Beds', sortable: true, className: 'text-center' },
    { key: 'bathrooms', header: 'Baths', sortable: true, className: 'text-center' },
    {
      key: 'monthly_rent',
      header: 'Monthly Rent',
      sortable: true,
      render: (u) => formatCurrency(u.monthly_rent),
    },
  ]

  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Units"
        subtitle={`${units.length} unit${units.length !== 1 ? 's' : ''}`}
        actions={
          <div className="flex gap-3 items-center">
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search units..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
            />
          </div>
        }
      />

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-10 rounded" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState
            title="No units found"
            description={search || propertyFilter ? 'Try adjusting your filters.' : 'No units have been added yet.'}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {columns.map((col) => (
                    <th key={col.key} className={`text-left px-5 py-3 font-medium text-gray-600 ${col.className || ''}`}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((unit) => (
                  <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className={`px-5 py-3.5 text-gray-700 ${col.className || ''}`}>
                        {col.render
                          ? col.render(unit)
                          : String(((unit as unknown) as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
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
