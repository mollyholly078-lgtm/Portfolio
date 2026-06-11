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
  const guessesList = Object.values(guesses).sort((a, b) => a.timestamp - b.timestamp)

  useEffect(() => {
    setGuess('')
  }, [state])

  const isRevealing = state === 'revealing'

  return (
    <div className="flex flex-col p-3 animate-fade-in">
      <div className="bg-accent/10 rounded-full px-3 py-0.5 mb-2 text-xs font-semibold text-accent self-center">
        Guess the word!
      </div>

      <div className="text-center mb-2">
        <p className="text-xs text-text-muted uppercase tracking-wider">{CATEGORY_EMOJIS[category as Category] || ''} {category}</p>
        <LetterBlanks word={currentWord} />
      </div>

      <div className="bg-surface rounded-xl p-2.5 mb-2 max-h-28 overflow-y-auto scrollbar-thin">
        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Description</p>
        {descriptions ? (
          <div className="space-y-0.5">
            {descriptions.split('\n').filter(Boolean).map((line, i) => (
              <p key={i} className="text-sm animate-fade-in">{line}</p>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-xs italic">Waiting for describer's clues...</p>
        )}
      </div>

      {!isRevealing && (
        <form onSubmit={(e) => { e.preventDefault(); if (!guess.trim()) return; onSubmitGuess(guess.trim()); setGuess('') }} className="mb-2">
          <div className="flex gap-1.5 max-w-full">
            <input type="text" value={guess} onChange={(e) => setGuess(e.target.value)}
              placeholder="Type your guess..." autoFocus
              className="flex-1 min-w-0 w-full bg-surface border border-border rounded-lg px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-accent/50" maxLength={100} />
            <button type="submit" disabled={!guess.trim()}
              className="bg-accent hover:bg-amber-600 disabled:opacity-50 text-black font-semibold px-2.5 py-2 rounded-lg text-xs transition-colors shrink-0 whitespace-nowrap">Guess</button>
          </div>
        </form>
      )}

      {guessesList.length > 0 && (
        <div className="bg-surface rounded-xl p-2.5 overflow-y-auto max-h-28 scrollbar-thin">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">All Guesses</p>
          <div className="space-y-0.5">
            {guessesList.map((g) => (
              <p key={g.id} className={`text-sm ${g.correct ? 'text-success font-bold' : ''}`}>{g.playerName}: {g.word}{g.correct ? ' ✓' : ''}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
