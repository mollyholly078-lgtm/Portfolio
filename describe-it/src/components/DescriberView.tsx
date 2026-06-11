import { useState, useEffect } from 'react'
import { CATEGORY_EMOJIS } from '../types'
import type { Category } from '../types'
import Timer from './Timer'
import LetterBlanks from './LetterBlanks'
import type { GuessEntry } from '../types'

interface Props {
  word: string
  wordOptions: string[]
  category: string
  descriptions: string
  timeLeft: number
  state: 'choosing' | 'describing'
  onChooseWord: (word: string) => Promise<void>
  onSkipWords: () => Promise<void>
  onSubmitDescription: (text: string) => Promise<void>
  guesses: Record<string, GuessEntry>
  skippedOnce: boolean
}

export default function DescriberView({
  word,
  wordOptions,
  category,
  descriptions,
  timeLeft,
  state,
  onChooseWord,
  onSkipWords,
  onSubmitDescription,
  guesses,
  skippedOnce,
}: Props) {
  const [desc, setDesc] = useState('')
  const [warning, setWarning] = useState(false)

  const guessesList = Object.values(guesses)

  useEffect(() => {
    setDesc('')
    setWarning(false)
  }, [state, word])

  if (state === 'choosing') {
    return (
      <div className="flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="bg-primary/10 rounded-full px-4 py-1 mb-4 text-sm font-semibold text-primary">
          You are describing!
        </div>
        <h2 className="text-xl font-bold mb-2">Pick a word to describe</h2>
        <p className="text-text-muted mb-6">
          {CATEGORY_EMOJIS[category as Category] || ''} Category: {category}
        </p>
        <div className="space-y-3 w-full max-w-sm">
          {wordOptions.map((w, i) => (
            <button
              key={i}
              onClick={() => onChooseWord(w)}
              className="w-full py-4 px-6 bg-surface hover:bg-surface-light border border-border rounded-xl text-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {w}
            </button>
          ))}
        </div>
        {!skippedOnce && (
          <button
            onClick={onSkipWords}
            className="mt-6 text-sm text-text-muted hover:text-accent transition-colors"
          >
            Skip — get 3 new words
          </button>
        )}
        {skippedOnce && (
          <p className="mt-6 text-xs text-text-muted">You've already used your skip</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col p-6 animate-fade-in">
      <div className="bg-primary/10 rounded-full px-4 py-1 mb-4 text-sm font-semibold text-primary self-center">
        You are describing!
      </div>

      <div className="mb-4">
        <Timer timeLeft={timeLeft} />
      </div>

      <div className="text-center mb-4">
        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
          {CATEGORY_EMOJIS[category as Category] || ''} {category}
        </p>
        <LetterBlanks word={word} />
      </div>

      <div className="bg-surface rounded-xl p-4 mb-4 max-h-48 overflow-y-auto scrollbar-thin">
        <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Your clues</p>
        {descriptions ? (
          <div className="space-y-1">
            {descriptions.split('\n').filter(Boolean).map((line, i) => (
              <p key={i} className="text-sm">{line}</p>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm italic">Start typing your description...</p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!desc.trim()) return
          const containsWord = desc.toLowerCase().includes(word.toLowerCase())
          if (containsWord) {
            setWarning(true)
            return
          }
          setWarning(false)
          onSubmitDescription(desc.trim())
          setDesc('')
        }}
        className="mb-4"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={desc}
            onChange={(e) => {
              setDesc(e.target.value)
              setWarning(false)
            }}
            placeholder="Type a clue..."
            className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
            maxLength={200}
            autoFocus
          />
          <button
            type="submit"
            disabled={!desc.trim()}
            className="bg-primary hover:bg-primary-dark disabled:opacity-50 px-4 py-3 rounded-lg font-semibold transition-colors"
          >
            Send
          </button>
        </div>
        {warning && (
          <p className="text-danger text-xs mt-1">⚠️ Your description contains the secret word!</p>
        )}
      </form>

      {guessesList.length > 0 && (
        <div className="bg-surface rounded-xl p-4 flex-1 overflow-y-auto max-h-40 scrollbar-thin">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Guesses</p>
          <div className="space-y-1">
            {guessesList.sort((a, b) => a.timestamp - b.timestamp).map((g) => (
              <p key={g.id} className={`text-sm ${g.correct ? 'text-success font-bold' : ''}`}>
                {g.playerName}: {g.word}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
