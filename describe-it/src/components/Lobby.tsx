import { useState } from 'react'
import { ROUND_OPTIONS } from '../types'
import PlayerAvatar from './PlayerAvatar'
import type { Player } from '../types'

interface Props {
  players: Player[]
  roomCode: string
  isHost: boolean
  onStart: (rounds: number) => void
  onLeave: () => void
}

export default function Lobby({ players, roomCode, isHost, onStart, onLeave }: Props) {
  const [rounds, setRounds] = useState<number>(3)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-1">DescribeIt</h1>
          <p className="text-text-muted text-sm">Room Code</p>
          <div className="text-3xl font-mono font-bold tracking-[0.3em] text-primary mt-1">
            {roomCode}
          </div>
        </div>

        <div className="bg-surface rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
            Players ({players.length}/4)
          </h3>
          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-surface-light/50"
              >
                <PlayerAvatar name={player.name} color={player.color} size="md" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{player.name}</span>
                    {player.isHost && (
                      <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-semibold">
                        HOST
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${player.connected ? 'bg-success' : 'bg-danger'}`}
                />
              </div>
            ))}
            {players.length < 4 && (
              <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-border opacity-50">
                <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center text-text-muted text-sm">
                  +
                </div>
                <span className="text-text-muted text-sm">Waiting for players...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {isHost && players.length >= 2 && (
            <div className="flex-1 space-y-3">
              <div className="flex gap-2 justify-center">
                {ROUND_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRounds(r)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      rounds === r
                        ? 'bg-primary text-white'
                        : 'bg-surface-light text-text-muted hover:text-text'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <button
                onClick={() => onStart(rounds)}
                className="w-full py-3 bg-success hover:bg-emerald-600 disabled:opacity-50 rounded-lg font-semibold text-lg transition-colors"
              >
                Start Game ({rounds} rounds)
              </button>
            </div>
          )}
          {!isHost && (
            <p className="w-full text-center text-text-muted text-sm py-3">
              Waiting for host to start the game...
            </p>
          )}
        </div>

        {players.length < 2 && isHost && (
          <p className="text-center text-text-muted text-sm mt-4">
            Need at least 2 players to start
          </p>
        )}

        <button
          onClick={onLeave}
          className="w-full mt-4 py-2 text-text-muted hover:text-danger transition-colors text-sm"
        >
          Leave Room
        </button>
      </div>
    </div>
  )
}
