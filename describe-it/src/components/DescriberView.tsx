import { useState, useEffect } from 'react'
import { CATEGORY_EMOJIS } from '../types'
import type { Category } from '../types'
import LetterBlanks from './LetterBlanks'
import type { GuessEntry } from '../types'

interface Props {
  word: string
  wordOptions: string[]
  category: string
  descriptions: string
  state: 'choosing' | 'describing'
  onChooseWord: (word: string) => Promise<void>
  onSetCustomWord: (word: string) => Promise<void>
  onSkipWords: () => Promise<void>
  onSubmitDescription: (text: string) => Promise<void>
  onGiveUp: () => Promise<void>
  guesses: Record<string, GuessEntry>
}

function ShowWordButton({ word }: { word: string }) {
  const [show, setShow] = useState(false)
  return (
    <button onClick={() => setShow(!show)}
      className="block mx-auto mt-2 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors px-3 py-1.5 rounded-lg">
      {show ? `"${word}"` : '👁 Tap to see the word'}
    </button>
  )
}

export default function DescriberView({
  word,
  wordOptions,
  category,
  descriptions,
  state,
  onChooseWord,
  onSetCustomWord,
  onSkipWords,
  onSubmitDescription,
  onGiveUp,
  guesses,
}: Props) {
  const [desc, setDesc] = useState('')
  const [warning, setWarning] = useState(false)
  const [customWord, setCustomWord] = useState('')

  const guessesList = Object.values(guesses)

  useEffect(() => {
    setDesc('')
    setWarning(false)
    setCustomWord('')
  }, [state, word])

  if (state === 'choosing') {
    return (
      <div className="flex flex-col p-3 animate-fade-in">
        <div className="bg-primary/10 rounded-full px-3 py-0.5 mb-2 text-xs font-semibold text-primary self-center">
          You are describing!
        </div>
        <p className="text-text-muted text-xs text-center mb-2">
          {CATEGORY_EMOJIS[category as Category] || ''} {category}
        </p>

        <div className="space-y-1.5 w-full max-w-sm mx-auto mb-2">
          {wordOptions.map((w, i) => (
            <button key={i} onClick={() => onChooseWord(w)}
              className="w-full py-2.5 px-3 bg-surface hover:bg-surface-light border border-border rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}>
              {w}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center justify-center mb-2">
          <button onClick={onSkipWords} className="text-xs text-text-muted hover:text-accent transition-colors">
            Skip — get 3 new words
          </button>
          <span className="text-text-muted text-xs">|</span>
          <form onSubmit={(e) => { e.preventDefault(); if (customWord.trim()) onSetCustomWord(customWord.trim()) }} className="flex gap-1 max-w-full">
            <input type="text" value={customWord} onChange={(e) => setCustomWord(e.target.value)}
              placeholder="Type your own word..." autoFocus
              className="flex-1 min-w-0 bg-surface border border-border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/50" />
            <button type="submit" disabled={!customWord.trim()}
              className="bg-primary hover:bg-primary-dark disabled:opacity-50 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 whitespace-nowrap">
              Use
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-3 animate-fade-in">
      <div className="bg-primary/10 rounded-full px-3 py-0.5 mb-2 text-xs font-semibold text-primary self-center">
        You are describing!
      </div>

      <div className="text-center mb-2">
        <p className="text-xs text-text-muted uppercase tracking-wider">{CATEGORY_EMOJIS[category as Category] || ''} {category}</p>
        <LetterBlanks word={word} />
        <ShowWordButton word={word} />
      </div>

      <div className="bg-surface rounded-xl p-2.5 mb-2 max-h-28 overflow-y-auto scrollbar-thin">
        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Your clues</p>
        {descriptions ? (
          <div className="space-y-0.5">
            {descriptions.split('\n').filter(Boolean).map((line, i) => (
              <p key={i} className="text-sm">{line}</p>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-xs italic">Start typing your description...</p>
        )}
      </div>

      <form onSubmit={(e) => {
        e.preventDefault()
        if (!desc.trim()) return
        if (desc.toLowerCase().includes(word.toLowerCase())) { setWarning(true); return }
        setWarning(false)
        onSubmitDescription(desc.trim())
        setDesc('')
      }} className="mb-2">
        <div className="flex gap-1.5 max-w-full">
          <input type="text" value={desc} onChange={(e) => { setDesc(e.target.value); setWarning(false) }}
            placeholder="Type a clue..." autoFocus
            className="flex-1 min-w-0 bg-surface border border-border rounded-lg px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/50" maxLength={200} />
          <button type="submit" disabled={!desc.trim()}
            className="bg-primary hover:bg-primary-dark disabled:opacity-50 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 whitespace-nowrap">Send</button>
        </div>
        {warning && <p className="text-danger text-xs mt-0.5">⚠️ Your description contains the secret word!</p>}
      </form>

      <div className="flex gap-2 mb-2">
        <button onClick={onGiveUp}
          className="text-xs text-text-muted hover:text-danger transition-colors px-2 py-1 rounded border border-border hover:border-danger/50">
          Give Up — Reveal Answer
        </button>
      </div>

      {guessesList.length > 0 && (
        <div className="bg-surface rounded-xl p-2.5 overflow-y-auto max-h-28 scrollbar-thin">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Guesses</p>
          <div className="space-y-0.5">
            {guessesList.sort((a, b) => a.timestamp - b.timestamp).map((g) => (
              <p key={g.id} className={`text-sm ${g.correct ? 'text-success font-bold' : ''}`}>{g.playerName}: {g.word}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
