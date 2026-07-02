import { useState } from 'react'
import { cn } from '@/lib/utils'
import api from '@/api/client'
import toast from 'react-hot-toast'

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']

interface CreateRequestModalProps {
  onClose: () => void
  onCreated: (req: any) => void
}

export default function CreateRequestModal({ onClose, onCreated }: CreateRequestModalProps) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM' })
  const [photo, setPhoto] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSubmitting(true)
    try {
      const res = await api.post('/api/v1/maintenance-requests', form)
      const created = res.data
      if (photo) {
        const fd = new FormData()
        fd.append('photo', photo)
        fd.append('photo_type', 'BEFORE')
        await api.post(`/api/v1/maintenance-requests/${created.id}/photos`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      toast.success('Request created')
      onCreated(res.data)
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">New Maintenance Request</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g. Leaking faucet"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
              placeholder="Describe the issue..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
