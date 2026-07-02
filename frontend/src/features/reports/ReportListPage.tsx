import { useState, useEffect } from 'react'
import api from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ReportDefinition {
  id: string
  name: string
  description?: string
  type: string
  last_generated?: string
  created_at: string
}

export default function ReportListPage() {
  const { user } = useAuthStore()
  const [reports, setReports] = useState<ReportDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [showBuilder, setShowBuilder] = useState(false)
  const [builderForm, setBuilderForm] = useState({ name: '', description: '', type: 'maintenance' })
  const [submitting, setSubmitting] = useState(false)
  const userRole = user?.roles?.[0]?.name
  const canManage = userRole === 'HEAD_ADMIN' || userRole === 'ADMIN'

  const fetchData = async () => {
    try {
      const res = await api.get<ReportDefinition[]>('/api/v1/reports')
      setReports(res.data)
    } catch {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleGenerate = async (reportId: string) => {
    setGenerating(reportId)
    try {
      const res = await api.post(`/api/v1/reports/${reportId}/generate`, {}, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${reportId}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Report generated')
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate report')
    } finally {
      setGenerating(null)
    }
  }

  const handleDownload = async (reportId: string) => {
    try {
      const res = await api.get(`/api/v1/reports/${reportId}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${reportId}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to download report')
    }
  }

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!builderForm.name.trim()) return
    setSubmitting(true)
    try {
      const res = await api.post('/api/v1/reports', builderForm)
      setReports((prev) => [res.data, ...prev])
      toast.success('Report definition created')
      setShowBuilder(false)
      setBuilderForm({ name: '', description: '', type: 'maintenance' })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create report')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Reports"
        subtitle={`${reports.length} report${reports.length !== 1 ? 's' : ''}`}
        actions={
          canManage && !showBuilder && (
            <button onClick={() => setShowBuilder(true)}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              + New Report
            </button>
          )
        }
      />

      {showBuilder && (
        <form onSubmit={handleCreateReport} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">Create Report Definition</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Report Name *</label>
            <input type="text" required value={builderForm.name}
              onChange={(e) => setBuilderForm({ ...builderForm, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea value={builderForm.description}
              onChange={(e) => setBuilderForm({ ...builderForm, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" rows={2} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select value={builderForm.type}
              onChange={(e) => setBuilderForm({ ...builderForm, type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="maintenance">Maintenance</option>
              <option value="financial">Financial</option>
              <option value="occupancy">Occupancy</option>
              <option value="inspection">Inspection</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowBuilder(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState title="No reports" description="Create your first report definition." />
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{r.name}</h3>
                  {r.description && <p className="text-sm text-gray-500 mt-0.5">{r.description}</p>}
                  <div className="flex gap-3 mt-2 text-xs text-gray-400">
                    <span className="capitalize">{r.type}</span>
                    {r.last_generated && <span>Last generated: {new Date(r.last_generated).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleGenerate(r.id)} disabled={generating === r.id}
                    className={cn('text-sm px-3 py-1.5 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50')}>
                    {generating === r.id ? 'Generating...' : 'Generate'}
                  </button>
                  <button onClick={() => handleDownload(r.id)}
                    className="text-sm px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
