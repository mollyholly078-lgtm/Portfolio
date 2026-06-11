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
      <div className="text-xs font-semibold text-text-muted uppercase tracking-wider px-3 py-2 border-b border-border">
        Guess Feed
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1.5">
        {entries.length === 0 && (
          <p className="text-text-muted text-sm text-center py-4">Waiting for guesses...</p>
        )}
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`animate-fade-in text-sm p-1.5 rounded ${
              entry.correct ? 'bg-success/20 text-success font-bold' : ''
            }`}
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
