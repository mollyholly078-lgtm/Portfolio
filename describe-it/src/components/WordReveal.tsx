import { CATEGORY_EMOJIS } from '../types'
import type { Category, RoundHistory } from '../types'

interface Props {
  word: string
  category: string
  history: RoundHistory | null
  timeLeft: number
}

export default function WordReveal({ word, category, history, timeLeft }: Props) {
  return (
    <div className="flex flex-col items-center justify-center p-8 animate-scale-in">
      <div className="bg-surface rounded-2xl p-8 text-center max-w-sm w-full shadow-lg">
        <p className="text-text-muted text-sm mb-2">
          {CATEGORY_EMOJIS[category as Category] || ''} {category}
        </p>
        <p className="text-3xl font-bold mb-2">The word was:</p>
        <p className="text-5xl font-black text-primary mb-4 animate-scale-in">{word} 🎉</p>

        {history?.correctGuesserName ? (
          <div className="bg-success/10 text-success rounded-lg p-3 mb-4">
            <p className="font-semibold">{history.correctGuesserName}</p>
            <p className="text-sm">got it right first!</p>
          </div>
        ) : (
          <div className="bg-surface-light rounded-lg p-3 mb-4">
            <p className="text-text-muted text-sm">No one guessed correctly</p>
          </div>
        )}

        <p className="text-text-muted text-sm">Next round in {timeLeft}s...</p>
      </div>
    </div>
  )
}
