import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '@/api/client'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatDate } from '@/lib/utils'

interface Lease {
  id: string
  unit_label: string
  property_name: string
  start_date: string
  end_date: string
  monthly_rent: number
  status: string
}

interface TenantDetail {
  id: string
  full_name: string
  email: string
  phone: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relation: string
  address_street: string
  address_city: string
  address_state: string
  address_zip: string
  leases: Lease[]
}

const LEASE_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  terminated: 'bg-gray-100 text-gray-700',
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{value || '—'}</p>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tenant, setTenant] = useState<TenantDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchTenant = async () => {
      try {
        const res = await api.get<TenantDetail>(`/v1/tenants/${id}`)
        setTenant(res.data)
      } catch {
        toast.error('Failed to load tenant details')
      } finally {
        setLoading(false)
      }
    }
    fetchTenant()
  }, [id])

  if (loading) {
    return (
      <div className="p-6 max-w-4xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="p-6 max-w-4xl">
        <EmptyState title="Tenant not found" description="The tenant you are looking for does not exist." />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <button
          onClick={() => navigate('/tenants')}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors mb-2 inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tenants
        </button>
        <PageHeader title={tenant.full_name} subtitle={tenant.email} />
      </div>

      <SectionCard title="Contact Information">
        <DetailRow label="Email" value={tenant.email} />
        <DetailRow label="Phone" value={tenant.phone} />
        <DetailRow label="Street" value={tenant.address_street} />
        <div className="flex gap-4">
          <DetailRow label="City" value={tenant.address_city} />
          <DetailRow label="State" value={tenant.address_state} />
          <DetailRow label="ZIP" value={tenant.address_zip} />
        </div>
      </SectionCard>

      <SectionCard title="Emergency Contact">
        <DetailRow label="Name" value={tenant.emergency_contact_name} />
        <DetailRow label="Phone" value={tenant.emergency_contact_phone} />
        <DetailRow label="Relation" value={tenant.emergency_contact_relation} />
      </SectionCard>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
          Leases ({tenant.leases.length})
        </h3>
        {tenant.leases.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No leases found for this tenant.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Unit</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Property</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Start Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">End Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tenant.leases.map((lease) => (
                  <tr key={lease.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900">{lease.unit_label}</td>
                    <td className="px-4 py-3 text-gray-700">{lease.property_name}</td>
                    <td className="px-4 py-3 text-gray-700">{formatDate(lease.start_date)}</td>
                    <td className="px-4 py-3 text-gray-700">{formatDate(lease.end_date)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          LEASE_STATUS_COLORS[lease.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {lease.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
