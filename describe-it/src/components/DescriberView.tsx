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
      className="block mx-auto mt-2 text-xs font-medium transition-colors px-3 py-1.5 rounded-lg"
      style={{
        color: 'var(--color-primary)',
        background: show ? 'rgba(91, 79, 207, 0.2)' : 'rgba(91, 79, 207, 0.1)',
        minHeight: '36px',
      }}>
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
  onGiveUp,
  guesses,
}: Props) {
  const [customWord, setCustomWord] = useState('')

  const guessesList = Object.values(guesses)

  useEffect(() => {
    setCustomWord('')
  }, [state, word])

  if (state === 'choosing') {
    return (
      <div className="flex flex-col p-4" style={{ animation: 'fade-in 0.4s ease-out' }}>
        <div
          className="rounded-full px-3 py-1 mb-2 text-xs font-semibold self-center"
          style={{
            background: 'rgba(91, 79, 207, 0.1)',
            color: 'var(--color-primary)',
          }}
        >
          You are describing!
        </div>
        <p className="text-xs text-center mb-3" style={{ color: 'var(--color-text-muted)' }}>
          {CATEGORY_EMOJIS[category as Category] || ''} {category}
        </p>

        <div className="space-y-1.5 w-full max-w-sm mx-auto mb-3">
          {wordOptions.map((w, i) => (
            <button key={i} onClick={() => onChooseWord(w)}
              className="w-full py-3 px-3 font-semibold transition-all text-sm"
              style={{
                background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-btn)',
                minHeight: '48px',
                cursor: 'pointer',
                color: 'var(--color-text)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'rgba(91, 79, 207, 0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-surface-alt)'; }}
            >
              {w}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 items-center">
          <button onClick={onSkipWords}
            className="text-xs transition-colors px-3 py-1.5 rounded-lg"
            style={{ color: 'var(--color-text-muted)', minHeight: '36px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--color-border)' }}>
            Skip — get 3 new words
          </button>
          <form onSubmit={(e) => { e.preventDefault(); if (customWord.trim()) onSetCustomWord(customWord.trim()) }} className="flex gap-1.5 w-full" style={{ maxWidth: '360px' }}>
            <input type="text" value={customWord} onChange={(e) => setCustomWord(e.target.value)}
              placeholder="Type your own word..."
              className="flex-1 min-w-0"
              style={{
                background: 'var(--color-surface)',
                border: '2px solid var(--color-border)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '0.9rem',
                fontFamily: "'Nunito', sans-serif",
                outline: 'none',
                color: 'var(--color-text)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(91, 79, 207, 0.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
            />
            <button type="submit" disabled={!customWord.trim()}
              className="font-semibold text-sm transition-colors shrink-0 whitespace-nowrap"
              style={{
                background: 'var(--color-primary)',
                opacity: !customWord.trim() ? 0.5 : 1,
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-btn)',
                padding: '12px 20px',
                cursor: !customWord.trim() ? 'not-allowed' : 'pointer',
                minHeight: '44px',
              }}>
              Use
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-4" style={{ animation: 'fade-in 0.4s ease-out' }}>
      <div
        className="rounded-full px-3 py-1 mb-2 text-xs font-semibold self-center"
        style={{
          background: 'rgba(91, 79, 207, 0.1)',
          color: 'var(--color-primary)',
        }}
      >
        You are describing!
      </div>

      <div className="text-center mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
          {CATEGORY_EMOJIS[category as Category] || ''} {category}
        </p>
        <LetterBlanks word={word} />
        <ShowWordButton word={word} />
      </div>

      {/* Clues Card */}
      <div
        className="p-4 mb-3"
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-border)',
          maxHeight: '150px',
          overflowY: 'auto',
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
          Your clues
        </p>
        {descriptions ? (
          <div className="space-y-1">
            {descriptions.split('\n').filter(Boolean).map((line, i) => (
              <p key={i} className="text-sm" style={{ color: 'var(--color-text)' }}>{line}</p>
            ))}
          </div>
        ) : (
          <p className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>Type clues in the Activity feed...</p>
        )}
      </div>

      <button onClick={onGiveUp}
        className="text-xs transition-colors self-center px-4 py-2 rounded-lg"
        style={{
          color: 'var(--color-text-muted)',
          border: '1px solid var(--color-border)',
          background: 'transparent',
          cursor: 'pointer',
          minHeight: '36px',
        }}>
        Give Up — Reveal Answer
      </button>

      {guessesList.length > 0 && (
        <div
          className="p-3 mt-3 overflow-y-auto scrollbar-thin"
          style={{
            background: 'var(--color-surface-alt)',
            borderRadius: 'var(--radius-card)',
            maxHeight: '120px',
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            Guesses
          </p>
          <div className="space-y-0.5">
            {guessesList.sort((a, b) => a.timestamp - b.timestamp).map((g) => (
              <p key={g.id} className="text-sm" style={g.correct ? { color: 'var(--color-correct)', fontWeight: 700 } : {}}>
                {g.playerName}: {g.word}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
