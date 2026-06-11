import { useState } from 'react'
import { CATEGORY_EMOJIS } from '../types'
import type { Category } from '../types'

interface Props {
  word: string
  wordOptions: string[]
  category: string
  state: 'choosing' | 'describing'
  onChooseWord: (word: string) => Promise<void>
  onSetCustomWord: (word: string) => Promise<void>
  onSkipWords: () => Promise<void>
  onGiveUp: () => Promise<void>
}

export default function DescriberView({
  wordOptions,
  category,
  state,
  onChooseWord,
  onSetCustomWord,
  onSkipWords,
}: Props) {
  const [customWord, setCustomWord] = useState('')

  if (state === 'choosing') {
    return (
      <div className="flex flex-col px-5 pb-6 pt-1" style={{ animation: 'fade-in 0.3s ease-out' }}>
        <p className="text-center text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
          Pick a word to describe
        </p>
        <p className="text-center text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
          {CATEGORY_EMOJIS[category as Category] || ''} {category}
        </p>

        <div className="space-y-2 w-full max-w-sm mx-auto mb-4">
          {wordOptions.map((w, i) => (
            <button
              key={i}
              onClick={() => onChooseWord(w)}
              className="w-full py-3 px-4 font-semibold transition-all text-sm"
              style={{
                background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
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
          <button
            onClick={onSkipWords}
            className="text-xs transition-colors px-3 py-1.5 rounded-lg"
            style={{ color: 'var(--color-text-muted)', cursor: 'pointer', background: 'transparent', border: '1px solid var(--color-border)' }}
          >
            Skip — get 3 new words
          </button>
          <form
            onSubmit={(e) => { e.preventDefault(); if (customWord.trim()) onSetCustomWord(customWord.trim()) }}
            className="flex gap-1.5 w-full"
            style={{ maxWidth: '360px' }}
          >
            <input
              type="text"
              value={customWord}
              onChange={(e) => setCustomWord(e.target.value)}
              placeholder="Type your own word..."
              className="flex-1 min-w-0"
              style={{
                background: 'var(--color-surface)',
                border: '2px solid var(--color-border)',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '0.85rem',
                fontFamily: "'Nunito', sans-serif",
                outline: 'none',
                color: 'var(--color-text)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(91, 79, 207, 0.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
            />
            <button
              type="submit"
              disabled={!customWord.trim()}
              className="font-semibold text-sm transition-colors shrink-0 whitespace-nowrap"
              style={{
                background: 'var(--color-primary)',
                opacity: !customWord.trim() ? 0.5 : 1,
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 18px',
                cursor: !customWord.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              Use
            </button>
          </form>
        </div>
      </div>
    )
  }

  return null
}
