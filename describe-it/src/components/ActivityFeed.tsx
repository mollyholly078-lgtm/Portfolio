import { useState, useEffect, useRef } from 'react'
import type { GuessEntry, ChatMessage } from '../types'

interface Props {
  guesses: Record<string, GuessEntry>
  chatMessages: Record<string, ChatMessage>
  descriptions?: string
  onSubmitGuess: (word: string) => Promise<void>
  onSendChatMessage: (message: string) => Promise<void>
  onSubmitDescription?: (text: string) => Promise<void>
  isDescriber: boolean
  roomState: string
  currentWord?: string
  playerId: string
  players: Array<{ id: string; name: string; color: string }>
  describerId: string | null
}

type ActivityEntry = {
  type: 'guess' | 'chat' | 'clue'
  id: string
  playerId: string
  playerName: string
  timestamp: number
  text: string
  correct?: boolean
}

function containsWord(text: string, target: string): boolean {
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text)
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ActivityFeed({
  guesses, chatMessages, descriptions, onSubmitGuess, onSendChatMessage,
  onSubmitDescription, isDescriber, roomState, currentWord, playerId, players, describerId,
}: Props) {
  const [input, setInput] = useState('')
  const [warning, setWarning] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const describerName = describerId ? players.find(p => p.id === describerId)?.name || 'Describer' : 'Describer'

  const guessEntries: ActivityEntry[] = Object.values(guesses).map((g) => ({
    type: 'guess', id: g.id, playerId: g.playerId, playerName: g.playerName,
    timestamp: g.timestamp, text: g.word, correct: g.correct,
  }))

  const chatEntries: ActivityEntry[] = Object.values(chatMessages).map((m) => ({
    type: 'chat', id: m.id, playerId: m.playerId, playerName: m.playerName,
    timestamp: m.timestamp, text: m.message,
  }))

  const clueEntries: ActivityEntry[] = descriptions
    ? descriptions.split('\n').filter(Boolean).map((line, i) => ({
        type: 'clue',
        id: `clue-${i}`,
        playerId: describerId || 'describer',
        playerName: describerName,
        timestamp: Date.now() + i,
        text: line,
      }))
    : []

  const entries = [...clueEntries, ...guessEntries, ...chatEntries].sort((a, b) => a.timestamp - b.timestamp)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length])

  const playerColorMap = new Map(players.map(p => [p.id, p.color]))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = input.trim()
    if (!val) return

    if (isDescriber && roomState === 'describing' && currentWord) {
      if (containsWord(val, currentWord)) {
        setWarning(true)
        return
      }
      setWarning(false)
      setInput('')
      onSubmitDescription?.(val)
    } else if (!isDescriber && roomState === 'describing' && currentWord && val.toLowerCase() === currentWord.toLowerCase()) {
      setInput('')
      onSubmitGuess(val)
    } else {
      setInput('')
      onSendChatMessage(val)
    }
  }

  const placeholderText = isDescriber && roomState === 'describing'
    ? 'Type a clue...'
    : !isDescriber && roomState === 'describing'
    ? 'Type your guess...'
    : roomState === 'choosing'
    ? 'Wait for describer to pick...'
    : 'Type a message...'

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-bg)' }}>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2 space-y-1">
        {entries.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {roomState === 'choosing' ? 'Describer is picking a word...' : 'No activity yet'}
            </p>
          </div>
        )}
        {entries.map((entry, i) => {
          const isOwn = entry.playerId === playerId
          const playerColor = playerColorMap.get(entry.playerId) || 'var(--color-primary)'
          const next = entries[i + 1]
          const prev = entries[i - 1]
          const isFirstInGroup = !prev || prev.playerId !== entry.playerId || (entry.timestamp - prev.timestamp > 120000)
          const showTimestamp = !next || next.playerId !== entry.playerId || (next.timestamp - entry.timestamp > 120000)

          return (
            <div key={`${entry.type}-${entry.id}`} style={{ marginBottom: showTimestamp ? '6px' : '2px' }}>
              {/* System message for correct guess */}
              {entry.type === 'guess' && entry.correct && isFirstInGroup && (
                <div className="flex justify-center my-2">
                  <div
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: 'rgba(76, 175, 125, 0.15)',
                      color: 'var(--color-correct)',
                      animation: 'fade-in 0.3s ease-out',
                    }}
                  >
                    🎉 {entry.playerName} got it right!
                  </div>
                </div>
              )}
              <div className="flex" style={{ justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                <div className="flex gap-1.5" style={{ maxWidth: '82%', flexDirection: isOwn ? 'row-reverse' : 'row' }}>
                  {!isOwn && (
                    <div
                      className="flex items-center justify-center shrink-0 rounded-full font-bold"
                      style={{
                        width: '30px',
                        height: '30px',
                        fontSize: '11px',
                        backgroundColor: `${playerColor}20`,
                        color: playerColor,
                        border: `2px solid ${playerColor}`,
                        opacity: isFirstInGroup ? 1 : 0,
                        marginTop: 'auto',
                      }}
                    >
                      {entry.playerName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    {!isOwn && isFirstInGroup && (
                      <p className="text-[10px] font-semibold mb-0.5 ml-1" style={{ color: playerColor }}>
                        {entry.playerName}
                      </p>
                    )}
                    <div
                      className="px-3 py-2"
                      style={{
                        background: entry.type === 'clue'
                          ? 'rgba(91, 79, 207, 0.1)'
                          : isOwn
                          ? playerColor
                          : 'var(--color-surface)',
                        color: isOwn ? '#fff' : 'var(--color-text)',
                        borderTopLeftRadius: isOwn ? '16px' : isFirstInGroup ? '16px' : '4px',
                        borderTopRightRadius: isOwn && isFirstInGroup ? '16px' : '4px',
                        borderBottomLeftRadius: '16px',
                        borderBottomRightRadius: '16px',
                        border: isOwn ? 'none' : '1px solid var(--color-border)',
                        fontSize: '0.875rem',
                        lineHeight: '1.4',
                        wordBreak: 'break-word',
                        animation: 'fade-in 0.2s ease-out',
                      }}
                    >
                      {entry.type === 'clue' && (
                        <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                          🔍&nbsp;
                        </span>
                      )}
                      {entry.text}
                      {entry.type === 'guess' && entry.correct && (
                        <span className="ml-1">✓</span>
                      )}
                    </div>
                    {showTimestamp && (
                      <p className="text-[10px] mt-0.5 px-1" style={{
                        color: 'var(--color-text-muted)',
                        textAlign: isOwn ? 'right' : 'left',
                      }}>
                        {formatTime(entry.timestamp)}
                        {entry.type === 'guess' && !entry.correct && (
                          <span className="ml-1">• guess</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="shrink-0" style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        {warning && (
          <p className="text-xs font-medium px-3 pt-1.5" style={{ color: 'var(--color-wrong)', animation: 'fade-in 0.2s ease-out' }}>
            ⚠️ Your clue contains the secret word!
          </p>
        )}
        <div className="flex items-center gap-2 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setWarning(false) }}
            placeholder={placeholderText}
            disabled={roomState === 'choosing' && !isDescriber}
            className="flex-1"
            style={{
              background: 'var(--color-bg)',
              border: `2px solid ${warning ? 'var(--color-wrong)' : 'var(--color-border)'}`,
              borderRadius: '24px',
              padding: '10px 16px',
              fontSize: '0.9rem',
              fontFamily: "'Nunito', sans-serif",
              outline: 'none',
              color: 'var(--color-text)',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => { if (!warning) e.target.style.borderColor = 'var(--color-primary)' }}
            onBlur={(e) => { if (!warning) e.target.style.borderColor = 'var(--color-border)' }}
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!input.trim() || (roomState === 'choosing' && !isDescriber)}
            className="flex items-center justify-center shrink-0 transition-all"
            style={{
              background: 'var(--color-primary)',
              opacity: !input.trim() || (roomState === 'choosing' && !isDescriber) ? 0.5 : 1,
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              cursor: !input.trim() || (roomState === 'choosing' && !isDescriber) ? 'not-allowed' : 'pointer',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}
