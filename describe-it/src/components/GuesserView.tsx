import { useState, useEffect } from 'react'
import { CATEGORY_EMOJIS } from '../types'
import type { Category } from '../types'
import Timer from './Timer'
import LetterBlanks from './LetterBlanks'
import type { GuessEntry } from '../types'

interface Props {
  category: string
  currentWord: string
  descriptions: string
  timeLeft: number
  turnDuration: number
  state: 'choosing' | 'describing' | 'revealing'
  onSubmitGuess: (word: string) => Promise<void>
  guesses: Record<string, GuessEntry>
}

export default function GuesserView({
  category,
  currentWord,
  descriptions,
  timeLeft,
  turnDuration,
  state,
  onSubmitGuess,
  guesses,
}: Props) {
  const [guess, setGuess] = useState('')

  const guessesList = Object.values(guesses).sort((a, b) => a.timestamp - b.timestamp)

  useEffect(() => {
    setGuess('')
  }, [state])

  const isRevealing = state === 'revealing'

  return (
    <div className="flex flex-col p-6 animate-fade-in">
      <div className="bg-accent/10 rounded-full px-4 py-1 mb-4 text-sm font-semibold text-accent self-center">
        Guess the word!
      </div>

      {!isRevealing && (
        <div className="mb-4">
          <Timer timeLeft={timeLeft} total={turnDuration} />
        </div>
      )}

      <div className="text-center mb-4">
        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
          {CATEGORY_EMOJIS[category as Category] || ''} {category}
        </p>
        <LetterBlanks word={currentWord} />
      </div>

      <div className="bg-surface rounded-xl p-4 mb-4 max-h-36 overflow-y-auto scrollbar-thin">
        <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Description</p>
        {descriptions ? (
          <div className="space-y-1">
            {descriptions.split('\n').filter(Boolean).map((line, i) => (
              <p key={i} className="text-sm animate-fade-in">{line}</p>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm italic">Waiting for describer's clues...</p>
        )}
      </div>

      {!isRevealing && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!guess.trim()) return
            onSubmitGuess(guess.trim())
            setGuess('')
          }}
          className="mb-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Type your guess..."
              className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-accent/50"
              maxLength={100}
              autoFocus
            />
            <button
              type="submit"
              disabled={!guess.trim()}
              className="bg-accent hover:bg-amber-600 disabled:opacity-50 text-black font-semibold px-4 py-3 rounded-lg transition-colors"
            >
              Guess
            </button>
          </div>
        </form>
      )}

      {guessesList.length > 0 && (
        <div className="bg-surface rounded-xl p-4 flex-1 overflow-y-auto max-h-40 scrollbar-thin">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">All Guesses</p>
          <div className="space-y-1">
            {guessesList.map((g) => (
              <p key={g.id} className={`text-sm ${g.correct ? 'text-success font-bold' : ''}`}>
                {g.playerName}: {g.word}{g.correct ? ' ✓' : ''}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
