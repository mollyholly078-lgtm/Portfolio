import { useEffect, useState } from 'react'
import { CATEGORY_EMOJIS } from '../types'
import type { Category } from '../types'
import LetterBlanks from './LetterBlanks'
import type { GuessEntry } from '../types'

interface Props {
  category: string
  currentWord: string
  state: 'choosing' | 'describing' | 'revealing'
  onSubmitGuess: (word: string) => Promise<void>
  guesses: Record<string, GuessEntry>
}

export default function GuesserView({
  category,
  currentWord,
  state,
  guesses,
}: Props) {
  const [questionKey, setQuestionKey] = useState(0)
  const guessesList = Object.values(guesses).sort((a, b) => a.timestamp - b.timestamp)

  useEffect(() => {
    setQuestionKey(prev => prev + 1)
  }, [state, currentWord])

  const isRevealing = state === 'revealing'

  return (
    <div className="flex flex-col px-2 py-4" style={{ animation: 'fade-in 0.4s ease-out' }} key={questionKey}>
      <div
        className="rounded-full px-3 py-1 mb-3 text-xs font-semibold self-center"
        style={{
          background: 'rgba(245, 166, 35, 0.1)',
          color: 'var(--color-accent)',
        }}
      >
        {isRevealing ? 'Round Complete!' : 'Guess the word!'}
      </div>

      {/* Category + Letter Blanks */}
      <div className="text-center mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
          {CATEGORY_EMOJIS[category as Category] || ''} {category}
        </p>
        <LetterBlanks word={currentWord} />
      </div>

      {state === 'choosing' && (
        <div
          className="p-6 mb-3"
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Describer is picking a word...
          </p>
        </div>
      )}

      {/* Guesses List */}
      {guessesList.length > 0 && (
        <div
          className="p-3 overflow-y-auto scrollbar-thin"
          style={{
            background: 'var(--color-surface-alt)',
            borderRadius: 'var(--radius-card)',
            maxHeight: '120px',
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            All Guesses
          </p>
          <div className="space-y-0.5">
            {guessesList.map((g) => (
              <p key={g.id} className="text-sm" style={g.correct ? { color: 'var(--color-correct)', fontWeight: 700 } : {}}>
                {g.playerName}: {g.word}{g.correct ? ' ✓' : ''}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
