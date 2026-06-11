import { CATEGORY_EMOJIS } from '../types'
import type { Category, RoundHistory } from '../types'

interface Props {
  word: string
  category: string
  history: RoundHistory | null
}

export default function WordReveal({ word, category, history }: Props) {
  return (
    <div className="flex flex-col items-center justify-center p-6 animate-scale-in">
      <div className="bg-surface rounded-2xl p-6 text-center max-w-sm w-full shadow-lg">
        <p className="text-text-muted text-xs mb-1">{CATEGORY_EMOJIS[category as Category] || ''} {category}</p>
        <p className="text-2xl font-bold mb-1">The word was:</p>
        <p className="text-4xl font-black text-primary mb-3 animate-scale-in">{word} 🎉</p>
        {history?.correctGuesserName ? (
          <div className="bg-success/10 text-success rounded-lg p-2 mb-3">
            <p className="font-semibold text-sm">{history.correctGuesserName}</p>
            <p className="text-xs">got it right first!</p>
          </div>
        ) : (
          <div className="bg-surface-light rounded-lg p-2 mb-3">
            <p className="text-text-muted text-xs">No one guessed correctly</p>
          </div>
        )}
        <p className="text-text-muted text-xs">Next turn starting soon...</p>
      </div>
    </div>
  )
}
