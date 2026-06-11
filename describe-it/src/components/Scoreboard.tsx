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
    <div
      className="p-4"
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
        animation: 'fade-in 0.4s ease-out',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Scoreboard</h3>
        {totalRounds > 0 && (
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Round {currentRound}/{totalRounds}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {sorted.map((player, i) => (
          <div
            key={player.id}
            className="flex items-center gap-3 p-2 rounded-lg transition-all"
            style={{
              background: player.id === describerId ? 'rgba(91, 79, 207, 0.08)' : 'transparent',
              ...(player.id === describerId ? { border: '1px solid rgba(91, 79, 207, 0.2)' } : {}),
            }}
          >
            <span className="text-xs font-medium w-4 shrink-0" style={{ color: 'var(--color-text-muted)' }}>{i + 1}.</span>
            <PlayerAvatar name={player.name} color={player.color} size="sm" />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{player.name}</span>
              {player.id === describerId && (
                <span
                  className="text-[10px] font-semibold ml-2 px-1.5 py-0.5 rounded"
                  style={{
                    background: 'rgba(91, 79, 207, 0.2)',
                    color: 'var(--color-primary)',
                  }}
                >
                  DESCRIBING
                </span>
              )}
            </div>
            <span
              className="text-lg font-bold font-mono"
              style={{ color: player.color }}
            >
              {player.score.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
