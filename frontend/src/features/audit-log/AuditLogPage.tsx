import { useState, useEffect } from 'react'
import api from '@/api/client'
import { cn, formatDateTime } from '@/lib/utils'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import toast from 'react-hot-toast'

interface AuditLog {
  id: string
  user_name: string
  action: string
  details?: string
  created_at: string
}

const ACTION_COLORS: Record<string, string> = {
  CREATED: 'bg-green-100 text-green-700',
  UPDATED: 'bg-blue-100 text-blue-700',
  DELETED: 'bg-red-100 text-red-700',
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await api.get<AuditLog[]>('/api/v1/audit-logs')
      setLogs(res.data)
    } catch {
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Audit Log"
        subtitle={`${logs.length} entr${logs.length !== 1 ? 'ies' : 'y'}`}
      />

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-5 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 rounded" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState title="No audit logs" description="No activity has been recorded yet." />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Time</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">User</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Action</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{log.user_name}</td>
                    <td className="px-5 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded font-medium', ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700')}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{log.details || '—'}</td>
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
