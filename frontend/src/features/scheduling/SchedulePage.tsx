import { useState, useEffect, useMemo } from 'react'
import api from '@/api/client'
import { cn, formatDate } from '@/lib/utils'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import toast from 'react-hot-toast'

interface ScheduleItem {
  id: string
  title: string
  date: string
  time?: string
  type: string
  status: string
  description?: string
  related_id?: string
}

const TYPE_COLORS: Record<string, string> = {
  inspection: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
  appointment: 'bg-green-100 text-green-700',
  showing: 'bg-purple-100 text-purple-700',
  meeting: 'bg-indigo-100 text-indigo-700',
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
  rescheduled: 'bg-orange-100 text-orange-700',
}

export default function SchedulePage() {
  const [items, setItems] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchData = async () => {
    try {
      const params: Record<string, string> = {}
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      const res = await api.get<ScheduleItem[]>('/api/v1/schedule', { params })
      setItems(res.data)
    } catch {
      toast.error('Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [dateFrom, dateTo])

  const today = new Date().toISOString().split('T')[0]
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Schedule"
        subtitle={`${items.length} item${items.length !== 1 ? 's' : ''}`}
        actions={
          <div className="flex gap-3 items-center">
            <input type="date" value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              max={dateTo || undefined}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <span className="text-xs text-gray-400">to</span>
            <input type="date" value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom || undefined}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(''); setDateTo('') }}
                className="text-xs text-blue-600 hover:text-blue-800">
                Clear
              </button>
            )}
          </div>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState
            title="No scheduled items"
            description={dateFrom || dateTo ? 'Try adjusting your date range.' : 'No items on the schedule.'}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-start gap-4">
              <div className="text-center flex-shrink-0 w-14">
                <div className="text-xs text-gray-500 uppercase">{new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                <div className="text-xl font-bold text-gray-900">{new Date(item.date).getDate()}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <span className={cn('text-xs px-2 py-0.5 rounded font-medium', TYPE_COLORS[item.type] || 'bg-gray-100 text-gray-700')}>
                      {item.type.replace(/_/g, ' ')}
                    </span>
                    <span className={cn('text-xs px-2 py-0.5 rounded font-medium', STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-700')}>
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                {item.time && (
                  <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
