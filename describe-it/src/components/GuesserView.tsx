import { useState, useEffect } from 'react'
import { CATEGORY_EMOJIS } from '../types'
import type { Category } from '../types'
import LetterBlanks from './LetterBlanks'
import type { GuessEntry } from '../types'

interface Props {
  category: string
  currentWord: string
  descriptions: string
  state: 'choosing' | 'describing' | 'revealing'
  onSubmitGuess: (word: string) => Promise<void>
  guesses: Record<string, GuessEntry>
}

export default function GuesserView({
  category,
  currentWord,
  descriptions,
  state,
  onSubmitGuess,
  guesses,
}: Props) {
  const [guess, setGuess] = useState('')
  const [shakeInput, setShakeInput] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [questionKey, setQuestionKey] = useState(0)
  const guessesList = Object.values(guesses).sort((a, b) => a.timestamp - b.timestamp)

  useEffect(() => {
    setGuess('')
    setErrorText(null)
    setShakeInput(false)
    setQuestionKey(prev => prev + 1)
  }, [state, currentWord])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!guess.trim()) return
    const g = guess.trim()
    setGuess('')
    onSubmitGuess(g)
  }

  useEffect(() => {
    const lastGuess = guessesList[guessesList.length - 1]
    if (lastGuess && lastGuess.playerName === 'You' || lastGuess?.playerId === 'local') {
      if (!lastGuess.correct) {
        setShakeInput(true)
        setErrorText('Not quite right — try again!')
        setTimeout(() => { setShakeInput(false); setErrorText(null) }, 1500)
      }
    }
  }, [guessesList.length])

  const isRevealing = state === 'revealing'

  return (
    <div className="flex flex-col p-4" style={{ animation: 'fade-in 0.4s ease-out' }} key={questionKey}>
      <div
        className="rounded-full px-3 py-1 mb-3 text-xs font-semibold self-center"
        style={{
          background: 'rgba(245, 166, 35, 0.1)',
          color: 'var(--color-accent)',
        }}
      >
        Guess the word!
      </div>

      {/* Category + Letter Blanks */}
      <div className="text-center mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
          {CATEGORY_EMOJIS[category as Category] || ''} {category}
        </p>
        <LetterBlanks word={currentWord} />
      </div>

      {/* Question Card */}
      <div
        className="p-6 mb-3"
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-border)',
          animation: 'slide-in-right 0.25s ease-out',
        }}
      >
        {descriptions ? (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Clues</p>
            {descriptions.split('\n').filter(Boolean).map((line, i) => (
              <p
                key={i}
                className="text-center"
                style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)' }}
              >
                {line}
              </p>
            ))}
          </div>
        ) : (
          <>
            <div className="shimmer-card h-6 w-3/4 mx-auto mb-2" />
            <div className="shimmer-card h-6 w-1/2 mx-auto" />
            <p className="text-center text-sm mt-3 italic" style={{ color: 'var(--color-text-muted)' }}>
              Waiting for describer's clues...
            </p>
          </>
        )}
      </div>

      {/* Input Area */}
      {!isRevealing && (
        <form onSubmit={handleSubmit} className="mb-3 flex flex-col items-center">
          <div className="flex gap-2 w-full" style={{ maxWidth: '360px' }}>
            <input
              type="text"
              value={guess}
              onChange={(e) => { setGuess(e.target.value); setErrorText(null) }}
              placeholder="Type your guess..."
              autoFocus
              className={`flex-1 min-w-0 ${shakeInput ? 'animate-shake' : ''}`}
              style={{
                width: '100%',
                maxWidth: '360px',
                border: `2px solid ${errorText ? 'var(--color-wrong)' : 'var(--color-border)'}`,
                borderRadius: '12px',
                padding: '14px 18px',
                fontSize: '1.1rem',
                fontFamily: "'Nunito', sans-serif",
                outline: 'none',
                color: 'var(--color-text)',
                background: 'var(--color-surface)',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => {
                if (!errorText) {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(91, 79, 207, 0.15)';
                }
              }}
              onBlur={(e) => {
                if (!errorText) {
                  e.target.style.borderColor = 'var(--color-border)';
                }
                e.target.style.boxShadow = 'none';
              }}
              maxLength={100}
            />
            <button
              type="submit"
              disabled={!guess.trim()}
              style={{
                background: !guess.trim() ? 'var(--color-primary)' : 'var(--color-primary)',
                opacity: !guess.trim() ? 0.5 : 1,
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-btn)',
                padding: '14px 24px',
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                cursor: !guess.trim() ? 'not-allowed' : 'pointer',
                transition: 'transform 0.08s ease',
                minHeight: '48px',
                whiteSpace: 'nowrap',
              }}
            >
              Guess
            </button>
          </div>
          {errorText && (
            <p
              className="text-sm mt-2 font-medium"
              style={{
                color: 'var(--color-wrong)',
                animation: 'fade-in 0.2s ease-out',
              }}
            >
              {errorText}
            </p>
          )}
        </form>
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
