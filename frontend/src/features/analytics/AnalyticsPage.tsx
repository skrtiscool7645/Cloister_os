import { useState, useEffect } from 'react'
import api from '@/api/client'
import { cn, formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/feedback/LoadingState'
import toast from 'react-hot-toast'

interface Stats {
  total_properties: number
  total_units: number
  occupied_units: number
  total_tenants: number
  active_leases: number
  pending_maintenance: number
  monthly_revenue: number
  maintenance_cost: number
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get<Stats>('/api/v1/analytics/summary')
        setStats(res.data)
      } catch {
        toast.error('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="p-6 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const occupancyRate = stats ? Math.round((stats.occupied_units / Math.max(stats.total_units, 1)) * 100) : 0

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your property metrics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Properties</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total_properties || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Units</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total_units || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Tenants</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total_tenants || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Active Leases</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.active_leases || 0}</p>
        </div>
      </div>

      {/* Occupancy */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Occupancy</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Occupied</span>
              <span className="font-medium">{occupancyRate}% ({stats?.occupied_units || 0}/{stats?.total_units || 0})</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${occupancyRate}%` }} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Vacant</p>
            <p className="text-sm font-medium">{(stats?.total_units || 0) - (stats?.occupied_units || 0)}</p>
          </div>
        </div>
      </div>

      {/* Revenue & Maintenance cost */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Monthly Revenue</h2>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(stats?.monthly_revenue || 0)}</p>
          <div className="mt-3 flex gap-2">
            {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-green-100 rounded-t" style={{ height: `${h * 0.6}px` }} />
                <span className="text-[10px] text-gray-400 mt-1">{['Jan','Feb','Mar','Apr','May','Jun','Jul'][i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Maintenance Costs</h2>
          <p className="text-3xl font-bold text-orange-600">{formatCurrency(stats?.maintenance_cost || 0)}</p>
          <div className="mt-3 flex gap-2">
            {[25, 45, 30, 60, 40, 55, 35].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-orange-100 rounded-t" style={{ height: `${h * 0.6}px` }} />
                <span className="text-[10px] text-gray-400 mt-1">{['Jan','Feb','Mar','Apr','May','Jun','Jul'][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending maintenance */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Pending Maintenance Requests</h2>
        <p className="text-3xl font-bold text-yellow-600">{stats?.pending_maintenance || 0}</p>
        <div className="mt-3 flex gap-2">
          {[12, 8, 15, 6, 10, 9, 14].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-yellow-100 rounded-t" style={{ height: `${h * 4}px` }} />
              <span className="text-[10px] text-gray-400 mt-1">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
