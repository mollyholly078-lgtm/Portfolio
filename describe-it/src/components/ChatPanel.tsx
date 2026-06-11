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
      <div className="text-xs font-bold uppercase tracking-wider px-3 py-2" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
        Chat
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {msgs.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>No messages yet</p>
        )}
        {msgs.map((msg) => (
          <div key={msg.id} style={{ animation: 'fade-in 0.3s ease-out' }}>
            <span className="text-xs font-semibold mr-1" style={{ color: msg.playerId === 'system' ? 'var(--color-text-muted)' : 'var(--color-text)' }}>
              {msg.playerName}:
            </span>
            <span className="text-sm" style={{ color: 'var(--color-text)' }}>{msg.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-2" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={disabled ? '' : 'Type a message...'}
            disabled={disabled}
            className="flex-1"
            style={{
              background: 'var(--color-surface-alt)',
              border: '2px solid var(--color-border)',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '0.85rem',
              fontFamily: "'Nunito', sans-serif",
              outline: 'none',
              color: 'var(--color-text)',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(91, 79, 207, 0.15)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
            maxLength={200}
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="text-sm font-medium transition-colors shrink-0"
            style={{
              background: 'var(--color-primary)',
              opacity: disabled || !input.trim() ? 0.5 : 1,
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-btn)',
              padding: '10px 16px',
              cursor: disabled || !input.trim() ? 'not-allowed' : 'pointer',
              minHeight: '40px',
            }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
