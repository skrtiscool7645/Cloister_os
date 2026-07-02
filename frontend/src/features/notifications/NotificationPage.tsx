import { useState, useEffect } from 'react'
import api from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { cn, formatDateTime } from '@/lib/utils'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  type: string
  title: string
  body?: string
  is_read: boolean
  created_at: string
}

const TYPE_ICONS: Record<string, string> = {
  maintenance: '\u{1F527}',
  lease: '\u{1F4C4}',
  payment: '\u{1F4B0}',
  message: '\u{2709}',
  alert: '\u{26A0}',
  info: '\u{2139}',
}

export default function NotificationPage() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await api.get<Notification[]>('/api/v1/notifications')
      setNotifications(res.data)
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/api/v1/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.post('/api/v1/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      toast.success('All marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread`}
        actions={
          unreadCount > 0 && (
            <button onClick={handleMarkAllRead}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
              Mark all as read
            </button>
          )
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState title="No notifications" description="You're all caught up!" />
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id}
              onClick={() => !n.is_read && handleMarkRead(n.id)}
              className={cn('bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-start gap-3 transition-colors cursor-pointer hover:bg-gray-50', !n.is_read && 'border-l-4 border-l-blue-500')}>
              <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] || '\u{2139}'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={cn('text-sm', !n.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700')}>
                    {n.title}
                  </h3>
                  {!n.is_read && (
                    <button onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id) }}
                      className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0">
                      Mark read
                    </button>
                  )}
                </div>
                {n.body && <p className="text-xs text-gray-500 mt-1">{n.body}</p>}
                <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
