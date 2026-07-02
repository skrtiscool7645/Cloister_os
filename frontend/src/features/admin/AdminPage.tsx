import { useState, useEffect } from 'react'
import api from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import toast from 'react-hot-toast'

interface AdminUser {
  id: string
  full_name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

interface Role {
  id: string
  name: string
  description: string
}

interface SystemSetting {
  key: string
  value: string
}

interface SystemStats {
  total_users: number
  total_properties: number
  total_units: number
  total_tenants: number
  total_leases: number
  total_work_orders: number
}

export default function AdminPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'settings' | 'stats'>('users')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [userSearch, setUserSearch] = useState('')
  const userRole = user?.roles?.[0]?.name
  const isHeadAdmin = userRole === 'HEAD_ADMIN'

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [uRes, rRes, sRes, statsRes] = await Promise.all([
          api.get<AdminUser[]>('/api/users'),
          api.get<Role[]>('/api/roles'),
          api.get<SystemSetting[]>('/api/settings'),
          api.get<SystemStats>('/api/v1/admin/stats'),
        ])
        setUsers(uRes.data)
        setRoles(rRes.data)
        setSettings(sRes.data)
        setStats(statsRes.data)
      } catch {
        toast.error('Failed to load admin data')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleToggleUser = async (userId: string, isActive: boolean) => {
    try {
      await api.patch(`/api/users/${userId}`, { is_active: !isActive })
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: !isActive } : u)))
      toast.success(isActive ? 'User deactivated' : 'User activated')
    } catch {
      toast.error('Failed to update user')
    }
  }

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      await api.put('/api/settings', { key, value })
      setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)))
      toast.success('Setting updated')
    } catch {
      toast.error('Failed to update setting')
    }
  }

  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true
    const q = userSearch.toLowerCase()
    return u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  const tabs = [
    { key: 'users' as const, label: 'User Management' },
    { key: 'roles' as const, label: 'Role Management' },
    { key: 'settings' as const, label: 'System Settings' },
    { key: 'stats' as const, label: 'System Stats' },
  ]

  if (loading) {
    return (
      <div className="p-6 max-w-4xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your system</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-4 -mb-px overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={cn('pb-2 pt-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors', activeTab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-4">
          <input type="text" placeholder="Search users..." value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48" />
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Role</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                    {isHeadAdmin && <th className="text-left px-5 py-3 font-medium text-gray-600">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{u.full_name}</td>
                      <td className="px-5 py-3.5 text-gray-700">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn('text-xs px-2 py-1 rounded font-medium', 'bg-blue-100 text-blue-700')}>
                          {u.role.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('text-xs px-2 py-1 rounded font-medium', u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {isHeadAdmin && (
                        <td className="px-5 py-3.5">
                          <button onClick={() => handleToggleUser(u.id, u.is_active)}
                            className={cn('text-sm transition-colors', u.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800')}>
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {roles.length === 0 ? (
            <EmptyState title="No roles found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Role</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {roles.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{r.name.replace(/_/g, ' ')}</td>
                      <td className="px-5 py-3.5 text-gray-700">{r.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {settings.length === 0 ? (
            <EmptyState title="No settings found" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Key</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Value</th>
                  {isHeadAdmin && <th className="text-left px-5 py-3 font-medium text-gray-600">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settings.map((s) => (
                  <SettingRow key={s.key} setting={s} onSave={handleUpdateSetting} canEdit={isHeadAdmin} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Users', value: stats?.total_users },
            { label: 'Properties', value: stats?.total_properties },
            { label: 'Units', value: stats?.total_units },
            { label: 'Tenants', value: stats?.total_tenants },
            { label: 'Leases', value: stats?.total_leases },
            { label: 'Work Orders', value: stats?.total_work_orders },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{item.value ?? 0}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SettingRow({ setting, onSave, canEdit }: { setting: SystemSetting; onSave: (key: string, value: string) => void; canEdit: boolean }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(setting.value)

  const handleSave = () => {
    onSave(setting.key, value)
    setEditing(false)
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-5 py-3.5 font-mono text-sm text-gray-700">{setting.key}</td>
      <td className="px-5 py-3.5">
        {editing ? (
          <input type="text" value={value}
            onChange={(e) => setValue(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm w-full" />
        ) : (
          <span className="text-sm text-gray-700">{setting.value}</span>
        )}
      </td>
      {canEdit && (
        <td className="px-5 py-3.5">
          {editing ? (
            <div className="flex gap-2">
              <button onClick={handleSave} className="text-xs text-green-600 hover:text-green-800">Save</button>
              <button onClick={() => { setEditing(false); setValue(setting.value) }} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="text-xs text-blue-600 hover:text-blue-800">Edit</button>
          )}
        </td>
      )}
    </tr>
  )
}
