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
    <div>
      <div className="space-y-1">
        {sorted.map((player, i) => (
          <div
            key={player.id}
            className="flex items-center gap-2 rounded-lg transition-all"
            style={{
              background: player.id === describerId ? 'rgba(91, 79, 207, 0.08)' : 'transparent',
              padding: '6px 8px',
              ...(player.id === describerId ? { border: '1px solid rgba(91, 79, 207, 0.15)' } : {}),
            }}
          >
            <span className="text-[11px] font-medium w-3 shrink-0" style={{ color: 'var(--color-text-muted)' }}>{i + 1}</span>
            <PlayerAvatar name={player.name} color={player.color} size="sm" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium truncate block" style={{ color: 'var(--color-text)' }}>{player.name}</span>
            </div>
            {player.id === describerId && (
              <span
                className="text-[9px] font-semibold px-1 py-0.5 rounded"
                style={{
                  background: 'rgba(91, 79, 207, 0.15)',
                  color: 'var(--color-primary)',
                }}
              >
                D
              </span>
            )}
            <span
              className="text-sm font-bold font-mono shrink-0"
              style={{ color: player.color, minWidth: '28px', textAlign: 'right' }}
            >
              {player.score.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
      {totalRounds > 0 && (
        <div className="text-center mt-2">
          <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Round {currentRound}/{totalRounds}
          </span>
        </div>
      )}
    </div>
  )
}
