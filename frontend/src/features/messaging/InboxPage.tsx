import { useState, useEffect, useMemo } from 'react'
import api from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { cn, formatDateTime } from '@/lib/utils'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import toast from 'react-hot-toast'

interface Conversation {
  id: string
  subject: string
  last_message?: string
  last_message_at: string
  participants: { id: string; full_name: string }[]
  unread_count: number
}

interface Message {
  id: string
  sender_name: string
  sender_id: string
  body: string
  created_at: string
}

interface User {
  id: string
  full_name: string
}

export default function InboxPage() {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [showCompose, setShowCompose] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [composeForm, setComposeForm] = useState({ subject: '', body: '', recipient_id: '' })
  const [sending, setSending] = useState(false)

  const fetchConversations = async () => {
    try {
      const res = await api.get<Conversation[]>('/api/v1/messages/conversations')
      setConversations(res.data)
    } catch {
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchConversations() }, [])

  useEffect(() => {
    if (!user) return
    api.get<User[]>('/api/users')
      .then((r) => setUsers(r.data.filter((u) => u.id !== user.id)))
      .catch(() => {})
  }, [user])

  const openConversation = async (convId: string) => {
    setSelectedConv(convId)
    setMessagesLoading(true)
    try {
      const res = await api.get<Message[]>(`/api/v1/messages/conversations/${convId}`)
      setMessages(res.data)
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c)),
      )
    } catch {
      toast.error('Failed to load messages')
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConv) return
    setSending(true)
    try {
      const res = await api.post(`/api/v1/messages/conversations/${selectedConv}`, { body: newMessage })
      setMessages((prev) => [...prev, res.data])
      setNewMessage('')
      fetchConversations()
    } catch {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleCompose = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!composeForm.subject.trim() || !composeForm.body.trim() || !composeForm.recipient_id) return
    setSending(true)
    try {
      const res = await api.post('/api/v1/messages/conversations', composeForm)
      setShowCompose(false)
      setComposeForm({ subject: '', body: '', recipient_id: '' })
      setSelectedConv(res.data.id)
      openConversation(res.data.id)
      fetchConversations()
      toast.success('Message sent')
    } catch {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0)

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            {totalUnread > 0 && <span className="ml-1 text-blue-600 font-medium">· {totalUnread} unread</span>}
          </p>
        </div>
        <button onClick={() => setShowCompose(true)}
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + Compose
        </button>
      </div>

      {showCompose && (
        <form onSubmit={handleCompose} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">New Message</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
            <select required value={composeForm.recipient_id}
              onChange={(e) => setComposeForm({ ...composeForm, recipient_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Select recipient...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
            <input type="text" required value={composeForm.subject}
              onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
            <textarea required value={composeForm.body}
              onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" rows={4} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={sending}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {sending ? 'Sending...' : 'Send'}
            </button>
            <button type="button" onClick={() => setShowCompose(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex gap-4 h-[60vh]">
        <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded" />)}
            </div>
          ) : conversations.length === 0 ? (
            <EmptyState title="No conversations" description="Start by composing a message." className="py-8" />
          ) : (
            <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
              {conversations.map((conv) => (
                <button key={conv.id} onClick={() => openConversation(conv.id)}
                  className={cn('w-full text-left p-4 hover:bg-gray-50 transition-colors', selectedConv === conv.id && 'bg-blue-50')}>
                  <div className="flex items-start justify-between">
                    <span className={cn('text-sm font-medium', conv.unread_count > 0 ? 'text-gray-900' : 'text-gray-700')}>
                      {conv.subject}
                    </span>
                    {conv.unread_count > 0 && (
                      <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full ml-2">{conv.unread_count}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {conv.participants.map((p) => p.full_name).join(', ')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 truncate">{conv.last_message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(conv.last_message_at)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState title="Select a conversation" description="Choose a conversation from the left to read messages." className="py-16" />
            </div>
          ) : messagesLoading ? (
            <div className="p-5 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.length === 0 ? (
                  <EmptyState title="No messages" description="Send the first message." className="py-12" />
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id
                    return (
                      <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                        <div className={cn('max-w-[70%] rounded-lg px-4 py-2', isMe ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800')}>
                          {!isMe && (
                            <p className="text-xs font-medium mb-1 opacity-70">{msg.sender_name}</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                          <p className={cn('text-[10px] mt-1', isMe ? 'text-blue-200' : 'text-gray-400')}>
                            {formatDateTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <div className="border-t border-gray-200 p-4 flex gap-2">
                <input type="text" value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <button onClick={handleSendMessage} disabled={!newMessage.trim() || sending}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
