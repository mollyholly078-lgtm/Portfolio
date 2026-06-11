import { useState } from 'react'
import { CATEGORIES, CATEGORY_EMOJIS } from '../types'
import type { Player } from '../types'
import PlayerAvatar from './PlayerAvatar'

interface Props {
  players: Player[]
  roomCode: string
  isHost: boolean
  onStart: (rounds: number, categories: string[]) => void
  onLeave: () => void
}

export default function Lobby({ players, roomCode, isHost, onStart, onLeave }: Props) {
  const [rounds, setRounds] = useState<string>('3')
  const [selectedCats, setSelectedCats] = useState<string[]>(CATEGORIES)

  const toggleCat = (cat: string) => {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-3" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-md" style={{ animation: 'fade-in 0.4s ease-out' }}>
        <div className="text-center mb-5">
          <h1
            className="mb-1"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--color-primary)',
            }}
          >
            Catkey
          </h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Room Code</p>
          <div
            className="text-2xl font-mono font-bold mt-1"
            style={{ color: 'var(--color-primary)', letterSpacing: '0.3em' }}
          >
            {roomCode}
          </div>
        </div>

        <div
          className="p-4 mb-3"
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Players ({players.length}/4)
          </h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
                <PlayerAvatar name={player.name} color={player.color} size="sm" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{player.name}</span>
                  {player.isHost && (
                    <span
                      className="text-[10px] font-semibold ml-1.5 px-1.5 py-0.5 rounded"
                      style={{
                        background: 'rgba(245, 166, 35, 0.2)',
                        color: 'var(--color-accent)',
                      }}
                    >
                      HOST
                    </span>
                  )}
                </div>
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: player.connected ? 'var(--color-correct)' : 'var(--color-wrong)' }}
                />
              </div>
            ))}
          </div>
        </div>

        {isHost && players.length >= 2 && (
          <div className="space-y-3">
            <div
              className="p-4"
              style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
                Game Settings
              </h3>

              <div className="mb-3">
                <p className="text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Rounds</p>
                <input type="number" min="1" max="50" value={rounds}
                  onChange={(e) => setRounds(e.target.value)}
                  className="w-full"
                  style={{
                    background: 'var(--color-surface-alt)',
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
              </div>

              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Categories</p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => {
                    const active = selectedCats.includes(cat)
                    return (
                      <button key={cat} onClick={() => toggleCat(cat)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: active ? 'rgba(91, 79, 207, 0.15)' : 'var(--color-surface-alt)',
                          color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                          border: active ? '1px solid rgba(91, 79, 207, 0.3)' : '1px solid transparent',
                          cursor: 'pointer',
                          minHeight: '36px',
                        }}>
                        {CATEGORY_EMOJIS[cat]} {cat}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <button onClick={() => onStart(parseInt(rounds) || 3, selectedCats)}
              disabled={selectedCats.length === 0}
              className="w-full font-bold transition-all"
              style={{
                background: 'var(--color-correct)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-btn)',
                padding: '16px 32px',
                fontSize: '1rem',
                opacity: selectedCats.length === 0 ? 0.5 : 1,
                cursor: selectedCats.length === 0 ? 'not-allowed' : 'pointer',
                minHeight: '52px',
              }}>
              Start Game
            </button>
          </div>
        )}

        {!isHost && <p className="text-center text-xs py-3" style={{ color: 'var(--color-text-muted)' }}>Waiting for host to configure and start the game...</p>}
        {players.length < 2 && isHost && <p className="text-center text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>Need at least 2 players to start</p>}

        <button onClick={onLeave}
          className="w-full mt-3 py-2 text-xs transition-colors"
          style={{
            color: 'var(--color-text-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            minHeight: '44px',
          }}>
          Leave Room
        </button>
      </div>
    </div>
  )
}
