import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import api from '@/api/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { setToken, setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const { access_token, user } = res.data
      setToken(access_token)
      setUser(user)
      toast.success('Logged in successfully')
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="bg-slate-900 px-6 py-8 text-center dark:bg-slate-800">
          <div className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Company OS</h1>
          <p className="text-slate-300 text-sm mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Username</label>
            <input type="text" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
              placeholder="Enter your username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Password</label>
            <input type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
              placeholder="Enter your password" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors font-medium text-sm">
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
