import PlayerAvatar from './PlayerAvatar'
import type { Player, RoundHistory } from '../types'

interface Props {
  players: Player[]
  wordHistory: Record<string, RoundHistory>
  onPlayAgain: () => void
  isHost: boolean
}

export default function FinalResults({ players, wordHistory, onPlayAgain, isHost }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const histories = Object.values(wordHistory)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-slide-up">
        <h1 className="text-3xl font-bold text-center mb-2">Game Over!</h1>
        <p className="text-text-muted text-center mb-8">Here's how everyone did</p>

        <div className="space-y-3 mb-8">
          {sorted.map((player, i) => (
            <div
              key={player.id}
              className={`flex items-center gap-4 p-4 rounded-xl ${
                i === 0 ? 'bg-accent/10 ring-1 ring-accent/30' : 'bg-surface'
              } animate-slide-up`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-2xl shrink-0">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
              </span>
              <PlayerAvatar name={player.name} color={player.color} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{player.name}</span>
                </div>
              </div>
              <span className="text-2xl font-bold font-mono" style={{ color: player.color }}>
                {player.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        {histories.length > 0 && (
          <div className="bg-surface rounded-xl p-4 mb-8">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Round History</h3>
            <div className="space-y-2">
              {histories.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-text-muted">R{i + 1}:</span>
                  <span className="font-semibold">{h.word}</span>
                  <span className="text-text-muted">({h.category})</span>
                  {h.correctGuesserName ? (
                    <span className="text-success text-xs">→ {h.correctGuesserName}</span>
                  ) : (
                    <span className="text-text-muted text-xs">→ No one guessed</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isHost && (
          <button
            onClick={onPlayAgain}
            className="w-full py-4 bg-primary hover:bg-primary-dark rounded-xl text-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Play Again
          </button>
        )}
        {!isHost && (
          <p className="text-center text-text-muted text-sm">
            Waiting for host to start a new game...
          </p>
        )}
      </div>
    </div>
  )
}
