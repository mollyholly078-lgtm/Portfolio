import { useState, useEffect, useRef } from 'react'
import type { ChatMessage } from '../types'

interface Props {
  messages: Record<string, ChatMessage>
  onSend: (message: string) => Promise<void>
  disabled?: boolean
}

export default function ChatPanel({ messages, onSend, disabled }: Props) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const msgs = Object.values(messages).sort((a, b) => a.timestamp - b.timestamp)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs.length])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || disabled) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {msgs.length === 0 && (
          <p className="text-text-muted text-sm text-center py-4">No messages yet</p>
        )}
        {msgs.map((msg) => (
          <div key={msg.id} className="animate-fade-in">
            <span className="text-xs font-semibold mr-1" style={{ color: msg.playerId === 'system' ? '#94a3b8' : undefined }}>
              {msg.playerName}:
            </span>
            <span className="text-sm">{msg.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-2 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={disabled ? '' : 'Type a message...'}
            disabled={disabled}
            className="flex-1 bg-surface-light rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="bg-primary hover:bg-primary-dark disabled:opacity-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
