import { useState, useEffect, useRef, useCallback } from 'react'
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

type MsgType = 'guess' | 'chat' | 'clue'

interface ActivityEntry {
  type: MsgType
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
  const d = new Date(ts)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function shouldGroup(a: ActivityEntry, b: ActivityEntry): boolean {
  return a.playerId === b.playerId && (b.timestamp - a.timestamp) < 120000
}

export default function ActivityFeed({
  guesses, chatMessages, descriptions, onSubmitGuess, onSendChatMessage,
  onSubmitDescription, isDescriber, roomState, currentWord, playerId, players, describerId,
}: Props) {
  const [input, setInput] = useState('')
  const [warning, setWarning] = useState(false)
  const [replyTo, setReplyTo] = useState<{ playerName: string; text: string } | null>(null)
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

    const prefix = replyTo ? `↪ ${replyTo.playerName}: "${replyTo.text}"\n\n` : ''
    const finalMsg = prefix + val

    if (isDescriber && roomState === 'describing' && currentWord) {
      if (containsWord(val, currentWord)) {
        setWarning(true)
        return
      }
      setWarning(false)
      setInput('')
      setReplyTo(null)
      onSubmitDescription?.(val)
    } else if (!isDescriber && roomState === 'describing' && currentWord && val.toLowerCase() === currentWord.toLowerCase()) {
      setInput('')
      setReplyTo(null)
      onSubmitGuess(val)
    } else {
      setInput('')
      setReplyTo(null)
      onSendChatMessage(finalMsg)
    }
  }

  const handleReply = useCallback((entry: ActivityEntry) => {
    setReplyTo({ playerName: entry.playerName, text: entry.text })
  }, [])

  const placeholderText = isDescriber && roomState === 'describing'
    ? 'Type a clue...'
    : !isDescriber && roomState === 'describing'
    ? 'Type your guess...'
    : roomState === 'choosing'
    ? 'Wait for describer to pick...'
    : 'Type a message...'

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-bg)' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2" style={{ overscrollBehavior: 'contain' }}>
        {entries.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {roomState === 'choosing' ? 'Describer is picking a word...' : 'No activity yet'}
            </p>
          </div>
        )}
        {entries.map((entry, i) => {
          const isOwn = entry.playerId === playerId
          const prev = entries[i - 1]
          const next = entries[i + 1]
          const isFirstInGroup = !prev || !shouldGroup(prev, entry)
          const isLastInGroup = !next || !shouldGroup(entry, next)
          const playerColor = playerColorMap.get(entry.playerId) || 'var(--color-primary)'
          const isSystemCorrect = entry.type === 'guess' && entry.correct && isFirstInGroup

          return (
            <div
              key={`${entry.type}-${entry.id}`}
              className="relative"
              style={{
                marginBottom: isLastInGroup ? '4px' : '1px',
                animation: 'message-pop 0.2s ease-out',
              }}
            >
              {/* Correct guess badge */}
              {isSystemCorrect && (
                <div className="flex justify-center my-1.5">
                  <div
                    className="text-[11px] font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: 'rgba(76, 175, 125, 0.15)',
                      color: 'var(--color-correct)',
                      animation: 'pop-in 0.3s ease-out',
                    }}
                  >
                    🎉 {entry.playerName} guessed correctly!
                  </div>
                </div>
              )}

              {/* Message row */}
              <div className="flex group" style={{ justifyContent: isOwn ? 'flex-end' : 'flex-start', paddingLeft: isOwn ? '48px' : '0', paddingRight: isOwn ? '0' : '48px' }}>
                {/* Avatar for others */}
                {!isOwn && (
                  <div
                    className="flex items-end shrink-0"
                    style={{
                      width: '32px',
                      marginRight: '6px',
                      visibility: isFirstInGroup ? 'visible' : 'hidden',
                    }}
                  >
                    <div
                      className="flex items-center justify-center rounded-full font-bold"
                      style={{
                        width: '32px',
                        height: '32px',
                        fontSize: '12px',
                        backgroundColor: `${playerColor}20`,
                        color: playerColor,
                        border: `2px solid ${playerColor}`,
                      }}
                    >
                      {entry.playerName.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                )}

                <div className="flex-1 min-w-0" style={{ maxWidth: '82%' }}>
                  {/* Sender name for grouped messages */}
                  {!isOwn && isFirstInGroup && (
                    <p
                      className="text-[11px] font-semibold mb-0.5 ml-0.5"
                      style={{ color: playerColor }}
                    >
                      {entry.playerName}
                      {entry.type === 'clue' && (
                        <span className="text-[10px] font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>clue</span>
                      )}
                      {entry.type === 'guess' && (
                        <span className="text-[10px] font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>guess</span>
                      )}
                    </p>
                  )}

                  {/* Bubble */}
                  <div className="relative group">
                    {isOwn && isFirstInGroup && (
                      <p
                        className="text-[11px] font-semibold mb-0.5 text-right mr-0.5"
                        style={{ color: playerColor }}
                      >
                        You
                        {entry.type === 'clue' && (
                          <span className="text-[10px] font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>clue</span>
                        )}
                        {entry.type === 'guess' && (
                          <span className="text-[10px] font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>guess</span>
                        )}
                      </p>
                    )}

                    <div
                      className="px-3 py-2 text-sm leading-relaxed"
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
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        position: 'relative',
                      }}
                    >
                      {/* Reply quote */}
                      {entry.text.startsWith('↪ ') && (
                        <div
                          className="text-xs mb-1.5 pl-2 py-0.5 rounded"
                          style={{
                            borderLeft: `3px solid ${isOwn ? 'rgba(255,255,255,0.5)' : 'var(--color-primary)'}`,
                            color: isOwn ? 'rgba(255,255,255,0.8)' : 'var(--color-text-muted)',
                            fontSize: '0.75rem',
                          }}
                        >
                          {entry.text.split('\n\n')[0].replace('↪ ', '')}
                        </div>
                      )}

                      {/* Message content */}
                      {entry.type === 'clue' && (
                        <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                          🔍&nbsp;
                        </span>
                      )}
                      {entry.text.split('\n\n').slice(-1)[0]}
                      {entry.type === 'guess' && entry.correct && (
                        <span className="ml-1">✓</span>
                      )}
                    </div>

                    {/* Reply button on hover */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleReply(entry) }}
                      className="absolute bottom-0 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: 'var(--color-text-muted)',
                        lineHeight: 0,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        [isOwn ? 'left' : 'right']: '-28px',
                      }}
                      aria-label="Reply"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 17 4 12 9 7" />
                        <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Timestamp */}
                  {isLastInGroup && (
                    <p
                      className="text-[10px] mt-0.5 px-1"
                      style={{
                        color: 'var(--color-text-muted)',
                        textAlign: isOwn ? 'right' : 'left',
                      }}
                    >
                      {formatTime(entry.timestamp)}
                      {entry.type === 'guess' && !entry.correct && (
                        <span className="ml-1">• guess</span>
                      )}
                      {entry.type === 'guess' && entry.correct && (
                        <span className="ml-1">• correct!</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Spacer for own messages (replaces avatar) */}
                {isOwn && <div style={{ width: '32px', marginLeft: '6px' }} />}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply bar */}
      {replyTo && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 shrink-0"
          style={{
            background: 'var(--color-surface-alt)',
            borderTop: '1px solid var(--color-border)',
            animation: 'slide-up 0.15s ease-out',
          }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold" style={{ color: 'var(--color-primary)' }}>
              Replying to {replyTo.playerName}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
              {replyTo.text}
            </p>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px', lineHeight: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="shrink-0" style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        {warning && (
          <p className="text-[11px] font-medium px-3 pt-1.5" style={{ color: 'var(--color-wrong)', animation: 'fade-in 0.2s ease-out' }}>
            ⚠️ Your clue contains the secret word!
          </p>
        )}
        <div className="flex items-end gap-2 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setWarning(false) }}
              placeholder={placeholderText}
              disabled={roomState === 'choosing' && !isDescriber}
              className="w-full"
              style={{
                background: 'var(--color-bg)',
                border: `2px solid ${warning ? 'var(--color-wrong)' : 'var(--color-border)'}`,
                borderRadius: '22px',
                padding: '10px 16px',
                paddingRight: '40px',
                fontSize: '0.9rem',
                fontFamily: "'Nunito', sans-serif",
                outline: 'none',
                color: 'var(--color-text)',
                transition: 'border-color 0.2s ease',
                minHeight: '42px',
              }}
              onFocus={(e) => { if (!warning) e.target.style.borderColor = 'var(--color-primary)' }}
              onBlur={(e) => { if (!warning) e.target.style.borderColor = 'var(--color-border)' }}
              maxLength={200}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || (roomState === 'choosing' && !isDescriber)}
            className="flex items-center justify-center shrink-0 transition-all"
            style={{
              background: !input.trim() || (roomState === 'choosing' && !isDescriber) ? 'var(--color-border)' : 'var(--color-primary)',
              color: !input.trim() || (roomState === 'choosing' && !isDescriber) ? 'var(--color-text-muted)' : '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              cursor: !input.trim() || (roomState === 'choosing' && !isDescriber) ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}
