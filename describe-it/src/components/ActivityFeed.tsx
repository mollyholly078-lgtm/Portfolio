import { useState, useEffect, useRef } from 'react'
import type { GuessEntry, ChatMessage } from '../types'

interface Props {
  guesses: Record<string, GuessEntry>
  chatMessages: Record<string, ChatMessage>
  onSubmitGuess: (word: string) => Promise<void>
  onSendChatMessage: (message: string) => Promise<void>
  isDescriber: boolean
  roomState: string
}

type ActivityEntry = {
  type: 'guess' | 'chat'
  id: string
  playerId: string
  playerName: string
  timestamp: number
  text: string
  correct?: boolean
}

export default function ActivityFeed({
  guesses, chatMessages, onSubmitGuess, onSendChatMessage, isDescriber, roomState,
}: Props) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const guessEntries: ActivityEntry[] = Object.values(guesses).map((g) => ({
    type: 'guess' as const, id: g.id, playerId: g.playerId, playerName: g.playerName,
    timestamp: g.timestamp, text: g.word, correct: g.correct,
  }))

  const chatEntries: ActivityEntry[] = Object.values(chatMessages).map((m) => ({
    type: 'chat' as const, id: m.id, playerId: m.playerId, playerName: m.playerName,
    timestamp: m.timestamp, text: m.message,
  }))

  const entries = [...guessEntries, ...chatEntries].sort((a, b) => a.timestamp - b.timestamp)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length])

  const isSingleWord = (text: string): boolean => /^[a-zA-Z0-9]+$/.test(text)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = input.trim()
    if (!val) return
    setInput('')

    if (!isDescriber && roomState === 'describing' && isSingleWord(val)) {
      onSubmitGuess(val)
    } else {
      onSendChatMessage(val)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="text-xs font-bold uppercase tracking-wider px-3 py-2 shrink-0" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
        Activity
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1.5">
        {entries.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>No activity yet</p>
        )}
        {entries.map((entry) => (
          <div
            key={`${entry.type}-${entry.id}`}
            className="text-sm p-1.5 rounded"
            style={{
              animation: 'fade-in 0.3s ease-out',
              background: entry.type === 'guess' && entry.correct ? 'rgba(76, 175, 125, 0.15)' : 'transparent',
            }}
          >
            <span
              className="text-xs font-semibold mr-1"
              style={{
                color: entry.type === 'guess' && entry.correct
                  ? 'var(--color-correct)'
                  : entry.type === 'chat'
                  ? 'var(--color-text-muted)'
                  : 'var(--color-text)',
              }}
            >
              {entry.playerName}:
            </span>
            <span
              style={{
                color: entry.type === 'guess' && entry.correct ? 'var(--color-correct)' : 'var(--color-text)',
                fontWeight: entry.type === 'guess' && entry.correct ? 700 : 400,
              }}
            >
              {entry.text}
            </span>
            {entry.type === 'guess' && entry.correct && (
              <span className="ml-1" style={{ color: 'var(--color-correct)' }}>✓</span>
            )}
            {entry.type === 'guess' && !entry.correct && (
              <span className="ml-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>(guess)</span>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-2 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isDescriber ? 'Type a message...' : 'Type a guess or chat message...'}
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
            disabled={!input.trim()}
            className="text-sm font-medium transition-colors shrink-0"
            style={{
              background: 'var(--color-primary)',
              opacity: !input.trim() ? 0.5 : 1,
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-btn)',
              padding: '10px 16px',
              cursor: !input.trim() ? 'not-allowed' : 'pointer',
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
