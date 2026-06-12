import { useState, useEffect, useRef } from 'react'
import { CATEGORY_EMOJIS } from '../types'
import type { Category } from '../types'
import LetterBlanks from './LetterBlanks'

interface Props {
  word: string
  wordOptions: string[]
  category: string
  state: 'choosing' | 'describing'
  onChooseWord: (word: string) => Promise<void>
  onSetCustomWord: (word: string) => Promise<void>
  onSkipWords: () => Promise<void>
  onGiveUp: () => Promise<void>
  onSubmitDescription?: (text: string) => Promise<void>
  descriptions?: string
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

function containsWord(text: string, target: string): boolean {
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text)
}

export default function DescriberView({
  word,
  wordOptions,
  category,
  state,
  onChooseWord,
  onSetCustomWord,
  onSkipWords,
  onGiveUp,
  onSubmitDescription,
  descriptions,
}: Props) {
  const [customWord, setCustomWord] = useState('')
  const [clueInput, setClueInput] = useState('')
  const [clueWarning, setClueWarning] = useState(false)
  const cluesBottomRef = useRef<HTMLDivElement>(null)
  const clueLines = descriptions ? descriptions.split('\n').filter(Boolean) : []

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

  const handleClueSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = clueInput.trim()
    if (!val) return
    if (containsWord(val, word)) {
      setClueWarning(true)
      return
    }
    setClueWarning(false)
    setClueInput('')
    onSubmitDescription?.(val)
  }

  useEffect(() => {
    cluesBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [clueLines.length])

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

      <div className="flex flex-col">
        <div className="text-xs font-bold uppercase tracking-wider px-1 py-1.5" style={{ color: 'var(--color-text-muted)' }}>
          Your Clues
        </div>
        <div className="max-h-48 overflow-y-auto activity-scroll space-y-1 px-1 mb-2">
          {clueLines.length === 0 && (
            <p className="text-sm text-center py-3" style={{ color: 'var(--color-text-muted)' }}>No clues yet — type your first clue below</p>
          )}
          {clueLines.map((line, i) => (
            <div key={i} className="text-sm p-2 rounded-lg" style={{ background: 'rgba(91, 79, 207, 0.06)', animation: 'fade-in 0.3s ease-out' }}>
              <span className="text-xs font-semibold mr-1" style={{ color: 'var(--color-primary)' }}>🔍 Clue {i + 1}:</span>
              <span style={{ color: 'var(--color-text)' }}>{line}</span>
            </div>
          ))}
          <div ref={cluesBottomRef} />
        </div>

        <form onSubmit={handleClueSubmit} style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={clueInput}
              onChange={(e) => { setClueInput(e.target.value); setClueWarning(false) }}
              placeholder="Type a clue..."
              className="flex-1"
              style={{
                background: 'var(--color-surface-alt)',
                border: `2px solid ${clueWarning ? 'var(--color-wrong)' : 'var(--color-border)'}`,
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '0.85rem',
                fontFamily: "'Nunito', sans-serif",
                outline: 'none',
                color: 'var(--color-text)',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => { if (!clueWarning) { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(91, 79, 207, 0.15)'; } }}
              onBlur={(e) => { if (!clueWarning) { e.target.style.borderColor = 'var(--color-border)'; } e.target.style.boxShadow = 'none'; }}
              maxLength={200}
            />
            <button
              type="submit"
              disabled={!clueInput.trim()}
              className="text-sm font-medium transition-colors shrink-0"
              style={{
                background: 'var(--color-primary)',
                opacity: !clueInput.trim() ? 0.5 : 1,
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-btn)',
                padding: '10px 16px',
                cursor: !clueInput.trim() ? 'not-allowed' : 'pointer',
                minHeight: '40px',
              }}
            >
              Send
            </button>
          </div>
          {clueWarning && (
            <p className="text-sm mt-1.5 font-medium" style={{ color: 'var(--color-wrong)', animation: 'fade-in 0.2s ease-out' }}>
              ⚠️ Your clue contains the secret word!
            </p>
          )}
        </form>
      </div>

      <button onClick={onGiveUp}
        className="text-xs transition-colors self-center px-4 py-2 rounded-lg mt-3"
        style={{
          color: 'var(--color-text-muted)',
          border: '1px solid var(--color-border)',
          background: 'transparent',
          cursor: 'pointer',
          minHeight: '36px',
        }}>
        Give Up — Reveal Answer
      </button>

    </div>
  )
}
