import { CATEGORY_EMOJIS } from '../types'
import type { Category, RoundHistory } from '../types'

interface Props {
  word: string
  category: string
  history: RoundHistory | null
}

export default function WordReveal({ word, category, history }: Props) {
  return (
    <div className="flex flex-col items-center justify-center p-6" style={{ animation: 'scale-in 0.3s ease-out' }}>
      <div
        className="p-6 text-center max-w-sm w-full"
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
          {CATEGORY_EMOJIS[category as Category] || ''} {category}
        </p>
        <p className="text-2xl font-bold mb-1" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>The word was:</p>
        <p
          className="text-4xl font-black mb-4"
          style={{
            color: 'var(--color-primary)',
            fontFamily: "'Fraunces', Georgia, serif",
            animation: 'scale-in 0.3s ease-out',
          }}
        >
          {word} 🎉
        </p>
        {history?.correctGuesserName ? (
          <div
            className="p-3 mb-3 rounded-lg"
            style={{
              background: 'rgba(76, 175, 125, 0.1)',
              color: 'var(--color-correct)',
            }}
          >
            <p className="font-semibold text-sm">{history.correctGuesserName}</p>
            <p className="text-xs">got it right first!</p>
          </div>
        ) : (
          <div
            className="p-3 mb-3 rounded-lg"
            style={{
              background: 'var(--color-surface-alt)',
              color: 'var(--color-text-muted)',
            }}
          >
            <p className="text-xs">No one guessed correctly</p>
          </div>
        )}
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Next turn starting soon...</p>
      </div>
    </div>
  )
}
