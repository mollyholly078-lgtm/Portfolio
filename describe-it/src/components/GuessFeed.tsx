import { useEffect, useRef } from 'react'
import type { GuessEntry } from '../types'

interface Props {
  guesses: Record<string, GuessEntry>
}

export default function GuessFeed({ guesses }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const entries = Object.values(guesses).sort((a, b) => a.timestamp - b.timestamp)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length])

  return (
    <div className="flex flex-col h-full">
      <div className="text-xs font-bold uppercase tracking-wider px-3 py-2" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
        Guess Feed
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1.5">
        {entries.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>Waiting for guesses...</p>
        )}
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="text-sm p-1.5 rounded"
            style={{
              animation: 'fade-in 0.3s ease-out',
              background: entry.correct ? 'rgba(76, 175, 125, 0.15)' : 'transparent',
              color: entry.correct ? 'var(--color-correct)' : 'var(--color-text)',
              fontWeight: entry.correct ? 700 : 400,
            }}
          >
            <span className="text-xs font-semibold mr-1">{entry.playerName}:</span>
            <span>{entry.word}</span>
            {entry.correct && <span className="ml-1">✓</span>}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
