import { useState } from 'react'
import { CATEGORIES, CATEGORY_EMOJIS } from '../types'
import type { Player } from '../types'
import PlayerAvatar from './PlayerAvatar'

interface Props {
  players: Player[]
  roomCode: string
  isHost: boolean
  onStart: (rounds: number, turnDuration: number, categories: string[]) => void
  onLeave: () => void
}

export default function Lobby({ players, roomCode, isHost, onStart, onLeave }: Props) {
  const [rounds, setRounds] = useState<string>('3')
  const [timer, setTimer] = useState<string>('60')
  const [selectedCats, setSelectedCats] = useState<string[]>(CATEGORIES)

  const toggleCat = (cat: string) => {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-5">
          <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Catkey</h1>
          <p className="text-text-muted text-xs">Room Code</p>
          <div className="text-2xl font-mono font-bold tracking-[0.3em] text-primary mt-0.5">{roomCode}</div>
        </div>

        <div className="bg-surface rounded-xl p-3 mb-3">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Players ({players.length}/4)</h3>
          <div className="space-y-1.5">
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-2 p-2 rounded-lg bg-surface-light/50">
                <PlayerAvatar name={player.name} color={player.color} size="sm" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">{player.name}</span>
                  {player.isHost && <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-semibold ml-1">HOST</span>}
                </div>
                <div className={`w-2 h-2 rounded-full shrink-0 ${player.connected ? 'bg-success' : 'bg-danger'}`} />
              </div>
            ))}
          </div>
        </div>

        {isHost && players.length >= 2 && (
          <div className="space-y-3">
            <div className="bg-surface rounded-xl p-3">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Game Settings</h3>

              <div className="mb-3">
                <p className="text-xs text-text-muted mb-1">Rounds</p>
                <input type="number" min="1" max="50" value={rounds}
                  onChange={(e) => setRounds(e.target.value)}
                  className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div className="mb-3">
                <p className="text-xs text-text-muted mb-1">Timer (seconds)</p>
                <input type="number" min="10" max="300" value={timer}
                  onChange={(e) => setTimer(e.target.value)}
                  className="w-full bg-surface-light border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div>
                <p className="text-xs text-text-muted mb-1.5">Categories</p>
                <div className="flex flex-wrap gap-1">
                  {CATEGORIES.map((cat) => {
                    const active = selectedCats.includes(cat)
                    return (
                      <button key={cat} onClick={() => toggleCat(cat)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-primary/20 text-primary ring-1 ring-primary/40' : 'bg-surface-light text-text-muted hover:text-text'}`}>
                        {CATEGORY_EMOJIS[cat]} {cat}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <button onClick={() => onStart(parseInt(rounds) || 3, parseInt(timer) || 60, selectedCats)}
              disabled={selectedCats.length === 0}
              className="w-full py-3 bg-success hover:bg-emerald-600 disabled:opacity-50 rounded-lg font-semibold text-base transition-colors">
              Start Game
            </button>
          </div>
        )}

        {!isHost && <p className="text-center text-text-muted text-xs py-3">Waiting for host to configure and start the game...</p>}
        {players.length < 2 && isHost && <p className="text-center text-text-muted text-xs mt-3">Need at least 2 players to start</p>}

        <button onClick={onLeave} className="w-full mt-3 py-2 text-text-muted hover:text-danger transition-colors text-xs">Leave Room</button>
      </div>
    </div>
  )
}
