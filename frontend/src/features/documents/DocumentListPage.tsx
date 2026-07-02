import { useState, useEffect, useMemo } from 'react'
import api from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { cn, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Document {
  id: string
  name: string
  type: string
  size: number
  related_type?: string
  related_id?: string
  uploaded_by_name?: string
  version: number
  url: string
  created_at: string
}

const RELATED_TYPES = ['', 'property', 'unit', 'tenant', 'lease', 'work_order', 'maintenance', 'vendor']

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentListPage() {
  const { user } = useAuthStore()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [relatedFilter, setRelatedFilter] = useState('')
  const [uploading, setUploading] = useState(false)
  const userRole = user?.roles?.[0]?.name
  const canUpload = userRole === 'HEAD_ADMIN' || userRole === 'ADMIN' || userRole === 'MANAGER'

  const fetchData = async () => {
    try {
      const params: Record<string, string> = {}
      if (relatedFilter) params.related_type = relatedFilter
      const res = await api.get<Document[]>('/api/v1/documents', { params })
      setDocuments(res.data)
    } catch {
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [relatedFilter])

  const filtered = useMemo(() => {
    if (!search) return documents
    const q = search.toLowerCase()
    return documents.filter((d) => d.name.toLowerCase().includes(q))
  }, [documents, search])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      await api.post('/api/v1/documents/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Document uploaded')
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <PageHeader
        title="Documents"
        subtitle={`${documents.length} document${documents.length !== 1 ? 's' : ''}`}
        actions={
          <div className="flex flex-wrap gap-3 items-center">
            <select value={relatedFilter} onChange={(e) => setRelatedFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              {RELATED_TYPES.map((t) => (
                <option key={t} value={t}>{t ? t.replace(/_/g, ' ') : 'All Types'}</option>
              ))}
            </select>
            <input type="text" placeholder="Search documents..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48" />
            {canUpload && (
              <label className={cn('text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap', uploading && 'opacity-50 pointer-events-none')}>
                {uploading ? 'Uploading...' : '+ Upload'}
                <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            )}
          </div>
        }
      />

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState
            title="No documents found"
            description={search || relatedFilter ? 'Try adjusting your filters.' : 'Upload your first document.'}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600">Size</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Related To</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Uploaded By</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-center px-5 py-3 font-medium text-gray-600">Version</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <a href={doc.url} target="_blank" rel="noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                        {doc.name}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{doc.type || '—'}</td>
                    <td className="px-5 py-3.5 text-right text-gray-700">{formatFileSize(doc.size)}</td>
                    <td className="px-5 py-3.5 text-gray-700 capitalize">{doc.related_type?.replace(/_/g, ' ') || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-700">{doc.uploaded_by_name || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-700">{formatDate(doc.created_at)}</td>
                    <td className="px-5 py-3.5 text-center text-gray-700">v{doc.version}</td>
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
