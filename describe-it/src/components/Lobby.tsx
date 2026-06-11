import { useState } from 'react'
import { ROUND_OPTIONS, TIMER_OPTIONS, CATEGORIES, CATEGORY_EMOJIS } from '../types'
import type { Player } from '../types'
import PlayerAvatar from './PlayerAvatar'

interface Props {
  players: Player[]
  roomCode: string
  isHost: boolean
  onStart: (rounds: number, timer: number, categories: string[]) => void
  onLeave: () => void
}

export default function Lobby({ players, roomCode, isHost, onStart, onLeave }: Props) {
  const [rounds, setRounds] = useState<number>(3)
  const [timer, setTimer] = useState<number>(60)
  const [selectedCats, setSelectedCats] = useState<string[]>(CATEGORIES)

  const toggleCat = (cat: string) => {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Catkey</h1>
          <p className="text-text-muted text-sm">Room Code</p>
          <div className="text-3xl font-mono font-bold tracking-[0.3em] text-primary mt-1">
            {roomCode}
          </div>
        </div>

        <div className="bg-surface rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
            Players ({players.length}/4)
          </h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-3 p-2 rounded-lg bg-surface-light/50">
                <PlayerAvatar name={player.name} color={player.color} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{player.name}</span>
                    {player.isHost && (
                      <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-semibold">HOST</span>
                    )}
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${player.connected ? 'bg-success' : 'bg-danger'}`} />
              </div>
            ))}
          </div>
        </div>

        {isHost && players.length >= 2 && (
          <div className="space-y-4">
            <div className="bg-surface rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Game Settings</h3>

              <div className="mb-3">
                <p className="text-xs text-text-muted mb-2">Rounds</p>
                <div className="flex gap-2">
                  {ROUND_OPTIONS.map((r) => (
                    <button key={r} onClick={() => setRounds(r)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${rounds === r ? 'bg-primary text-white' : 'bg-surface-light text-text-muted hover:text-text'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-text-muted mb-2">Timer per turn</p>
                <div className="flex gap-2">
                  {TIMER_OPTIONS.map((t) => (
                    <button key={t} onClick={() => setTimer(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${timer === t ? 'bg-primary text-white' : 'bg-surface-light text-text-muted hover:text-text'}`}>
                      {t}s
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-text-muted mb-2">Categories</p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => {
                    const active = selectedCats.includes(cat)
                    return (
                      <button key={cat} onClick={() => toggleCat(cat)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-primary/20 text-primary ring-1 ring-primary/40' : 'bg-surface-light text-text-muted hover:text-text'}`}>
                        {CATEGORY_EMOJIS[cat]} {cat}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => onStart(rounds, timer, selectedCats)}
              disabled={selectedCats.length === 0}
              className="w-full py-3 bg-success hover:bg-emerald-600 disabled:opacity-50 rounded-lg font-semibold text-lg transition-colors"
            >
              Start Game
            </button>
          </div>
        )}

        {!isHost && (
          <p className="text-center text-text-muted text-sm py-3">
            Waiting for host to configure and start the game...
          </p>
        )}

        {players.length < 2 && isHost && (
          <p className="text-center text-text-muted text-sm mt-4">Need at least 2 players to start</p>
        )}

        <button onClick={onLeave} className="w-full mt-4 py-2 text-text-muted hover:text-danger transition-colors text-sm">
          Leave Room
        </button>
      </div>
    </div>
  )
}
