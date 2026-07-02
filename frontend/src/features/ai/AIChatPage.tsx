import { useState, useEffect, useRef } from 'react'
import api from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { cn, formatDateTime } from '@/lib/utils'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import toast from 'react-hot-toast'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface Conversation {
  id: string
  title: string
  updated_at: string
}

export default function AIChatPage() {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchConversations = async () => {
    try {
      const res = await api.get<Conversation[]>('/api/v1/ai/conversations')
      setConversations(res.data)
    } catch {
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchConversations() }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openConversation = async (convId: string) => {
    setSelectedConv(convId)
    setMessagesLoading(true)
    try {
      const res = await api.get<ChatMessage[]>(`/api/v1/ai/conversations/${convId}`)
      setMessages(res.data)
    } catch {
      toast.error('Failed to load messages')
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleNewConversation = async () => {
    try {
      const res = await api.post<Conversation>('/api/v1/ai/conversations', { title: 'New Chat' })
      setConversations((prev) => [res.data, ...prev])
      setSelectedConv(res.data.id)
      setMessages([])
    } catch {
      toast.error('Failed to create conversation')
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    if (!selectedConv) return

    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      const res = await api.post<ChatMessage>(`/api/v1/ai/conversations/${selectedConv}/messages`, { content: userMsg.content })
      setMessages((prev) => [...prev, res.data])
      fetchConversations()
    } catch {
      toast.error('Failed to get response')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-sm text-gray-500 mt-1">Ask questions about your properties</p>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100%-4rem)]">
        <div className="w-72 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <button onClick={handleNewConversation}
              className="w-full text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              + New Chat
            </button>
          </div>
          {loading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
            </div>
          ) : conversations.length === 0 ? (
            <EmptyState title="No conversations" description="Start a new chat." className="py-8" />
          ) : (
            <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
              {conversations.map((conv) => (
                <button key={conv.id} onClick={() => openConversation(conv.id)}
                  className={cn('w-full text-left p-3 hover:bg-gray-50 transition-colors', selectedConv === conv.id && 'bg-blue-50')}>
                  <p className="text-sm font-medium text-gray-800 truncate">{conv.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(conv.updated_at)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState title="Select a conversation" description="Choose a conversation or start a new chat." className="py-16" />
            </div>
          ) : messagesLoading ? (
            <div className="p-5 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.length === 0 ? (
                  <EmptyState title="Start a conversation" description="Send a message to begin." className="py-12" />
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-[75%] rounded-lg px-4 py-2', msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800')}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={cn('text-[10px] mt-1', msg.role === 'user' ? 'text-blue-200' : 'text-gray-400')}>
                          {formatDateTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-gray-200 p-4 flex gap-2">
                <input type="text" value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="Ask the AI assistant..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <button onClick={handleSend} disabled={!input.trim() || sending || !selectedConv}
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
