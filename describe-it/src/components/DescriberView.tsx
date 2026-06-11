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
  turnDuration: number
  state: 'choosing' | 'describing'
  onChooseWord: (word: string) => Promise<void>
  onSetCustomWord: (word: string) => Promise<void>
  onSkipWords: () => Promise<void>
  onSubmitDescription: (text: string) => Promise<void>
  guesses: Record<string, GuessEntry>
}

export default function DescriberView({
  word,
  wordOptions,
  category,
  descriptions,
  timeLeft,
  turnDuration,
  state,
  onChooseWord,
  onSetCustomWord,
  onSkipWords,
  onSubmitDescription,
  guesses,
}: Props) {
  const [desc, setDesc] = useState('')
  const [warning, setWarning] = useState(false)
  const [customWord, setCustomWord] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const guessesList = Object.values(guesses)

  useEffect(() => {
    setDesc('')
    setWarning(false)
    setCustomWord('')
    setShowCustom(false)
  }, [state, word])

  if (state === 'choosing') {
    return (
      <div className="flex flex-col items-center p-4 animate-fade-in">
        <div className="bg-primary/10 rounded-full px-4 py-1 mb-3 text-sm font-semibold text-primary">
          You are describing!
        </div>
        <p className="text-text-muted mb-3 text-sm">
          {CATEGORY_EMOJIS[category as Category] || ''} {category}
        </p>

        <div className="space-y-2 w-full max-w-sm mb-3">
          {wordOptions.map((w, i) => (
            <button
              key={i}
              onClick={() => onChooseWord(w)}
              className="w-full py-3 px-4 bg-surface hover:bg-surface-light border border-border rounded-xl text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {w}
            </button>
          ))}
        </div>

        <button onClick={onSkipWords} className="text-sm text-text-muted hover:text-accent transition-colors mb-3">
          Skip — get 3 new words
        </button>

        {!showCustom ? (
          <button onClick={() => setShowCustom(true)} className="text-sm text-primary hover:text-primary-dark transition-colors">
            + Type my own word
          </button>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (customWord.trim()) onSetCustomWord(customWord.trim()) }} className="w-full max-w-sm flex gap-2">
            <input
              type="text" value={customWord} onChange={(e) => setCustomWord(e.target.value)}
              placeholder="Type your word..." autoFocus
              className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button type="submit" disabled={!customWord.trim()}
              className="bg-primary hover:bg-primary-dark disabled:opacity-50 px-3 py-2 rounded-lg text-sm font-semibold transition-colors">
              Use
            </button>
          </form>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col p-4 animate-fade-in">
      <div className="bg-primary/10 rounded-full px-4 py-1 mb-3 text-sm font-semibold text-primary self-center">
        You are describing!
      </div>

      <div className="mb-3">
        <Timer timeLeft={timeLeft} total={turnDuration} />
      </div>

      <div className="text-center mb-3">
        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
          {CATEGORY_EMOJIS[category as Category] || ''} {category}
        </p>
        <LetterBlanks word={word} />
      </div>

      <div className="bg-surface rounded-xl p-3 mb-3 max-h-36 overflow-y-auto scrollbar-thin">
        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Your clues</p>
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
          if (containsWord) { setWarning(true); return }
          setWarning(false)
          onSubmitDescription(desc.trim())
          setDesc('')
        }}
        className="mb-3"
      >
        <div className="flex gap-2">
          <input
            type="text" value={desc} onChange={(e) => { setDesc(e.target.value); setWarning(false) }}
            placeholder="Type a clue..." autoFocus
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50" maxLength={200}
          />
          <button type="submit" disabled={!desc.trim()}
            className="bg-primary hover:bg-primary-dark disabled:opacity-50 px-3 py-2 rounded-lg text-sm font-semibold transition-colors">
            Send
          </button>
        </div>
        {warning && <p className="text-danger text-xs mt-1">⚠️ Your description contains the secret word!</p>}
      </form>

      {guessesList.length > 0 && (
        <div className="bg-surface rounded-xl p-3 flex-1 overflow-y-auto max-h-32 scrollbar-thin">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Guesses</p>
          <div className="space-y-1">
            {guessesList.sort((a, b) => a.timestamp - b.timestamp).map((g) => (
              <p key={g.id} className={`text-sm ${g.correct ? 'text-success font-bold' : ''}`}>{g.playerName}: {g.word}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
