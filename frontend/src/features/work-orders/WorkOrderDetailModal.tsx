import { useState, useEffect } from 'react'
import api from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Material {
  id: string
  name: string
  quantity: number
  unit: string
  cost: number
}

interface Photo {
  id: string
  url: string
  photo_type: string
}

interface LaborLog {
  id: string
  worker_name: string
  hours: number
  description: string
  date: string
}

interface WorkOrder {
  id: string
  title: string
  description?: string
  priority: string
  status: string
  property_name?: string
  unit_number?: string
  assigned_to_name?: string
  assigned_to?: string
  scheduled_date?: string
  completed_date?: string
  created_at: string
  updated_at: string
  materials?: Material[]
  photos?: Photo[]
  labor_logs?: LaborLog[]
}

interface WorkOrderDetailModalProps {
  workOrder: WorkOrder
  onClose: () => void
  onUpdated: (updated: WorkOrder) => void
}

const PRIORITY_COLORS: Record<string, string> = {
  EMERGENCY: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-blue-100 text-blue-700',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  ASSIGNED: 'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const STATUSES = ['PENDING', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default function WorkOrderDetailModal({ workOrder, onClose, onUpdated }: WorkOrderDetailModalProps) {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'photos' | 'labor'>('details')
  const [submitting, setSubmitting] = useState(false)
  const [detail, setDetail] = useState<WorkOrder>(workOrder)
  const [scheduledDate, setScheduledDate] = useState(workOrder.scheduled_date || '')
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null)
  const userRole = user?.roles?.[0]?.name
  const canManage = userRole === 'HEAD_ADMIN' || userRole === 'ADMIN' || userRole === 'MANAGER'

  const [materialForm, setMaterialForm] = useState({ name: '', quantity: 1, unit: 'each', cost: 0 })
  const [laborForm, setLaborForm] = useState({ hours: 0, description: '' })

  useEffect(() => {
    api.get(`/api/v1/work-orders/${workOrder.id}`)
      .then((r) => setDetail(r.data))
      .catch(() => {})
  }, [workOrder.id])

  const handleStatusChange = async (status: string) => {
    setSubmitting(true)
    try {
      const res = await api.patch(`/api/v1/work-orders/${detail.id}/status`, { status })
      setDetail(res.data)
      onUpdated(res.data)
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSchedule = async () => {
    if (!scheduledDate) return
    setSubmitting(true)
    try {
      const res = await api.patch(`/api/v1/work-orders/${detail.id}/schedule`, { scheduled_date: scheduledDate })
      setDetail(res.data)
      onUpdated(res.data)
      toast.success('Scheduled')
    } catch {
      toast.error('Failed to schedule')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post(`/api/v1/work-orders/${detail.id}/materials`, materialForm)
      setDetail({ ...detail, materials: [...(detail.materials || []), res.data] })
      setMaterialForm({ name: '', quantity: 1, unit: 'each', cost: 0 })
      toast.success('Material added')
    } catch {
      toast.error('Failed to add material')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUploadPhotos = async () => {
    if (!photoFiles || photoFiles.length === 0) return
    setSubmitting(true)
    try {
      for (let i = 0; i < photoFiles.length; i++) {
        const fd = new FormData()
        fd.append('photo', photoFiles[i])
        fd.append('photo_type', 'WORK')
        await api.post(`/api/v1/work-orders/${detail.id}/photos`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      const res = await api.get(`/api/v1/work-orders/${detail.id}`)
      setDetail(res.data)
      setPhotoFiles(null)
      toast.success('Photos uploaded')
    } catch {
      toast.error('Failed to upload photos')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddLabor = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post(`/api/v1/work-orders/${detail.id}/labor`, laborForm)
      setDetail({ ...detail, labor_logs: [...(detail.labor_logs || []), res.data] })
      setLaborForm({ hours: 0, description: '' })
      toast.success('Labor logged')
    } catch {
      toast.error('Failed to log labor')
    } finally {
      setSubmitting(false)
    }
  }

  const tabs = [
    { key: 'details' as const, label: 'Details' },
    { key: 'materials' as const, label: `Materials (${(detail.materials || []).length})` },
    { key: 'photos' as const, label: `Photos (${(detail.photos || []).length})` },
    { key: 'labor' as const, label: `Labor (${(detail.labor_logs || []).length})` },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex justify-between items-center z-10">
          <h2 className="text-lg font-semibold text-gray-800">{detail.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="border-b border-gray-200 px-5">
          <div className="flex gap-4 -mb-px">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={cn('pb-2 pt-3 text-sm font-medium border-b-2 transition-colors', activeTab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {activeTab === 'details' && (
            <>
              <div>
                <span className="text-xs text-gray-500 block">Description</span>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.description || 'No description'}</p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-xs text-gray-500 block">Priority</span>
                  <span className={cn('text-xs px-2 py-1 rounded font-medium', PRIORITY_COLORS[detail.priority] || 'bg-gray-100 text-gray-700')}>
                    {detail.priority}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Status</span>
                  <span className={cn('text-xs px-2 py-1 rounded font-medium', STATUS_COLORS[detail.status] || 'bg-gray-100 text-gray-700')}>
                    {detail.status?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Created</span>
                  <span className="text-gray-600">{new Date(detail.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-xs text-gray-500 block">Location</span>
                <span>{detail.property_name}{detail.unit_number ? ` - Unit ${detail.unit_number}` : ''}</span>
              </div>
              {detail.assigned_to_name && (
                <div className="text-sm">
                  <span className="text-xs text-gray-500 block">Assigned To</span>
                  <span className="text-gray-700">{detail.assigned_to_name}</span>
                </div>
              )}
              {detail.scheduled_date && (
                <div className="text-sm">
                  <span className="text-xs text-gray-500 block">Scheduled Date</span>
                  <span className="text-gray-700">{new Date(detail.scheduled_date).toLocaleDateString()}</span>
                </div>
              )}
              {detail.completed_date && (
                <div className="text-sm">
                  <span className="text-xs text-gray-500 block">Completed Date</span>
                  <span className="text-gray-700">{new Date(detail.completed_date).toLocaleDateString()}</span>
                </div>
              )}

              {canManage && (
                <>
                  <div className="border-t pt-4">
                    <label className="text-xs font-medium text-gray-500 block mb-1">Schedule Date</label>
                    <div className="flex gap-2">
                      <input type="date" value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm" />
                      <button onClick={handleSchedule} disabled={!scheduledDate || submitting}
                        className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50">
                        Set
                      </button>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <label className="text-xs font-medium text-gray-500 block mb-1">Update Status</label>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map((s) => (
                        <button key={s} onClick={() => handleStatusChange(s)} disabled={submitting || s === detail.status}
                          className={cn('text-xs px-3 py-1.5 rounded border transition-colors', s === detail.status ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-700')}>
                          {s.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-4">
              {(!detail.materials || detail.materials.length === 0) ? (
                <p className="text-sm text-gray-400 py-4 text-center">No materials logged yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Material</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">Qty</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {detail.materials.map((m) => (
                      <tr key={m.id}>
                        <td className="px-4 py-2 text-gray-900">{m.name}</td>
                        <td className="px-4 py-2 text-right text-gray-700">{m.quantity} {m.unit}</td>
                        <td className="px-4 py-2 text-right text-gray-700">${m.cost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {canManage && (
                <form onSubmit={handleAddMaterial} className="flex flex-wrap gap-2 items-end border-t pt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Material</label>
                    <input type="text" required value={materialForm.name}
                      onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1.5 text-sm w-36" placeholder="Name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                    <input type="number" required min={1} value={materialForm.quantity}
                      onChange={(e) => setMaterialForm({ ...materialForm, quantity: Number(e.target.value) })}
                      className="border border-gray-300 rounded px-2 py-1.5 text-sm w-16" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
                    <input type="text" value={materialForm.unit}
                      onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1.5 text-sm w-20" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Cost</label>
                    <input type="number" required min={0} step="0.01" value={materialForm.cost}
                      onChange={(e) => setMaterialForm({ ...materialForm, cost: Number(e.target.value) })}
                      className="border border-gray-300 rounded px-2 py-1.5 text-sm w-20" />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50">
                    Add
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-4">
              {(!detail.photos || detail.photos.length === 0) ? (
                <p className="text-sm text-gray-400 py-4 text-center">No photos uploaded yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {detail.photos.map((p, i) => (
                    <a key={p.id || i} href={p.url} target="_blank" rel="noreferrer">
                      <img src={p.url} alt={`Photo ${i + 1}`} className="w-24 h-24 object-cover rounded border" />
                    </a>
                  ))}
                </div>
              )}
              {canManage && (
                <div className="border-t pt-4">
                  <label className="text-xs font-medium text-gray-500 block mb-1">Upload Photos</label>
                  <div className="flex gap-2 items-center">
                    <input type="file" multiple accept="image/*" onChange={(e) => setPhotoFiles(e.target.files)}
                      className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    <button onClick={handleUploadPhotos} disabled={!photoFiles || submitting}
                      className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50">
                      Upload
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'labor' && (
            <div className="space-y-4">
              {(!detail.labor_logs || detail.labor_logs.length === 0) ? (
                <p className="text-sm text-gray-400 py-4 text-center">No labor logged yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Worker</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Date</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">Hours</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {detail.labor_logs.map((l) => (
                      <tr key={l.id}>
                        <td className="px-4 py-2 text-gray-900">{l.worker_name}</td>
                        <td className="px-4 py-2 text-gray-700">{new Date(l.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-right text-gray-700">{l.hours}</td>
                        <td className="px-4 py-2 text-gray-700">{l.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {canManage && (
                <form onSubmit={handleAddLabor} className="flex flex-wrap gap-2 items-end border-t pt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Hours</label>
                    <input type="number" required min={0.5} step={0.5} value={laborForm.hours}
                      onChange={(e) => setLaborForm({ ...laborForm, hours: Number(e.target.value) })}
                      className="border border-gray-300 rounded px-2 py-1.5 text-sm w-16" />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    <input type="text" value={laborForm.description}
                      onChange={(e) => setLaborForm({ ...laborForm, description: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" placeholder="Work performed" />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50">
                    Log
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
