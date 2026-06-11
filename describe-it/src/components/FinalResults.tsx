import { useState } from 'react'
import PlayerAvatar from './PlayerAvatar'
import type { Player, RoundHistory } from '../types'

interface Props {
  players: Player[]
  wordHistory: Record<string, RoundHistory>
  onPlayAgain: () => void
  isHost: boolean
}

export default function FinalResults({ players, wordHistory, onPlayAgain, isHost }: Props) {
  const [copied, setCopied] = useState(false)
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const histories = Object.values(wordHistory)

  const bestScore = Math.max(...players.map(p => p.score))
  try { localStorage.setItem('catkey_best_score', String(bestScore)) } catch {
    // localStorage not available
  }

  const shareResult = async () => {
    const lines = sorted.map((p, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  '
      return `${medal} ${p.name}: ${p.score.toFixed(1)}`
    })
    const text = `🐱 Catkey Results\n${lines.join('\n')}\n\nPlay at: https://mollyholly078-lgtm.github.io/Portfolio/game/`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API not available
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'var(--color-overlay)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="w-full max-w-lg"
        style={{
          background: 'var(--color-surface)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          animation: 'scale-in 0.3s ease-out',
        }}
      >
        <h1
          className="text-center mb-1"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: '1.75rem',
          }}
        >
          {sorted[0]?.score > 0 ? '🎉 Well Played!' : '😿 Game Over'}
        </h1>

        <p className="text-center mb-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {sorted[0]?.name} takes the crown!
        </p>

        {/* Winner Score */}
        <div className="text-center mb-6">
          <p
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '2.5rem',
              fontWeight: 800,
              color: 'var(--color-primary)',
            }}
          >
            {sorted[0]?.score.toFixed(1)}
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Winner's Score
          </p>
        </div>

        {/* Leaderboard */}
        <div className="space-y-2 mb-6">
          {sorted.map((player, i) => (
            <div
              key={player.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: i === 0 ? 'rgba(245, 166, 35, 0.1)' : 'var(--color-surface-alt)',
                ...(i === 0 ? { border: '1px solid rgba(245, 166, 35, 0.3)' } : {}),
              }}
            >
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
              </span>
              <PlayerAvatar name={player.name} color={player.color} size="lg" />
              <div style={{ flex: 1 }}>
                <span className="font-semibold" style={{ fontSize: '1.1rem' }}>{player.name}</span>
              </div>
              <span
                className="font-bold font-mono"
                style={{ fontSize: '1.5rem', color: player.color }}
              >
                {player.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        {/* Round History */}
        {histories.length > 0 && (
          <div
            className="p-4 mb-6"
            style={{
              background: 'var(--color-surface-alt)',
              borderRadius: '12px',
            }}
          >
            <h3
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Round History
            </h3>
            <div className="space-y-1.5">
              {histories.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-sm flex-wrap">
                  <span style={{ color: 'var(--color-text-muted)' }}>R{i + 1}:</span>
                  <span className="font-semibold">{h.word}</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>({h.category})</span>
                  {h.correctGuesserName ? (
                    <span style={{ color: 'var(--color-correct)', fontSize: '0.75rem' }}>→ {h.correctGuesserName}</span>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>→ No one guessed</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={shareResult}
            className="w-full flex items-center justify-center gap-2 font-semibold transition-all"
            style={{
              background: 'var(--color-surface-alt)',
              color: 'var(--color-text)',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius-btn)',
              padding: '14px 32px',
              fontSize: '1rem',
              cursor: 'pointer',
              minHeight: '52px',
            }}
            onMouseDown={(e) => { (e.target as HTMLButtonElement).style.transform = 'scale(0.96)'; }}
            onMouseUp={(e) => { (e.target as HTMLButtonElement).style.transform = 'scale(1)'; }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = 'scale(1)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            {copied ? '✓ Copied!' : 'Share Results'}
          </button>

          {isHost ? (
            <button
              onClick={onPlayAgain}
              className="w-full font-bold transition-all"
              style={{
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-btn)',
                padding: '16px 32px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(91, 79, 207, 0.35)',
                minHeight: '52px',
              }}
              onMouseDown={(e) => { (e.target as HTMLButtonElement).style.transform = 'scale(0.96)'; }}
              onMouseUp={(e) => { (e.target as HTMLButtonElement).style.transform = 'scale(1)'; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = 'scale(1)'; }}
            >
              Play Again
            </button>
          ) : (
            <p className="text-center text-sm py-3" style={{ color: 'var(--color-text-muted)' }}>
              Waiting for host to start a new game...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
