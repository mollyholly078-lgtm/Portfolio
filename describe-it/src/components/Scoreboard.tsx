import type { Player } from '../types'
import PlayerAvatar from './PlayerAvatar'

interface Props {
  players: Player[]
  describerId: string | null
  currentRound: number
  totalRounds: number
}

export default function Scoreboard({ players, describerId, currentRound, totalRounds }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="bg-surface rounded-xl p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Scoreboard</h3>
        {totalRounds > 0 && (
          <span className="text-xs text-text-muted">
            Round {currentRound}/{totalRounds}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {sorted.map((player, i) => (
          <div
            key={player.id}
            className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
              player.id === describerId ? 'bg-primary/10 ring-1 ring-primary/30' : ''
            }`}
          >
            <span className="text-xs text-text-muted w-4 shrink-0">{i + 1}.</span>
            <PlayerAvatar name={player.name} color={player.color} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{player.name}</span>
                {player.id === describerId && (
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-semibold shrink-0">
                    DESCRIBING
                  </span>
                )}
              </div>
            </div>
            <span className="text-lg font-bold font-mono" style={{ color: player.color }}>
              {player.score.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
