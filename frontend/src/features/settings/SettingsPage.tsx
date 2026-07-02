import { useState, useEffect } from 'react'
import api from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { Skeleton } from '@/components/feedback/LoadingState'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({ full_name: '', email: '', phone: '' })
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [notifications, setNotifications] = useState({
    email_maintenance: true,
    email_lease: true,
    email_payment: true,
    sms_maintenance: false,
  })
  const [preferences, setPreferences] = useState({ theme: 'light', language: 'en' })
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [nRes, pRes] = await Promise.all([
          api.get('/api/v1/settings/notifications'),
          api.get('/api/v1/settings/preferences'),
        ])
        setNotifications(nRes.data)
        if (pRes.data.theme) {
          setPreferences(pRes.data)
        } else {
          setPreferences({ ...preferences, theme: 'light' })
        }
      } catch {
        setPreferences({ ...preferences, theme: 'light' })
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    if (user) {
      setProfile({ full_name: user.fullName || '', email: user.email || '', phone: user.phone || '' })
    }
  }, [user])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving('profile')
    try {
      const res = await api.patch('/api/auth/profile', profile)
      setUser(res.data.user)
      toast.success('Profile updated')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(null)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error('Passwords do not match')
      return
    }
    setSaving('password')
    try {
      await api.post('/api/auth/change-password', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      })
      toast.success('Password changed')
      setPwForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSaving(null)
    }
  }

  const handleNotificationToggle = async (key: string, value: boolean) => {
    const updated = { ...notifications, [key]: value }
    setNotifications(updated)
    try {
      await api.put('/api/v1/settings/notifications', updated)
      toast.success('Notification settings updated')
    } catch {
      setNotifications(notifications)
      toast.error('Failed to update')
    }
  }

  const handlePreferenceChange = async (key: string, value: string) => {
    const updated = { ...preferences, [key]: value }
    setPreferences(updated)
    try {
      await api.put('/api/v1/settings/preferences', updated)
      toast.success('Preferences updated')
    } catch {
      setPreferences(preferences)
      toast.error('Failed to update')
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and system preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Profile</h2>
        <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
            <input type="text" value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input type="email" value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <input type="tel" value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" disabled={saving === 'profile'}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving === 'profile' ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Security</h2>
        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
            <input type="password" required value={pwForm.current_password}
              onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
            <input type="password" required value={pwForm.new_password}
              onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
            <input type="password" required value={pwForm.confirm_password}
              onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="flex items-end justify-end">
            <button type="submit" disabled={saving === 'password'}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving === 'password' ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Notifications</h2>
        <div className="space-y-3">
          {[
            { key: 'email_maintenance', label: 'Email - Maintenance Updates' },
            { key: 'email_lease', label: 'Email - Lease Reminders' },
            { key: 'email_payment', label: 'Email - Payment Confirmations' },
            { key: 'sms_maintenance', label: 'SMS - Maintenance Alerts' },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">{item.label}</span>
              <input type="checkbox" checked={(notifications as any)[item.key]}
                onChange={(e) => handleNotificationToggle(item.key, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            </label>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Theme</label>
            <select value={preferences.theme}
              onChange={(e) => handlePreferenceChange('theme', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Language</label>
            <select value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="en">English</option>
              <option value="es">Spanish</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
