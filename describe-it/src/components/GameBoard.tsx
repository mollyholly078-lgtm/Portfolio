import { useState, useEffect, useRef } from 'react'
import type { Room } from '../types'
import DescriberView from './DescriberView'
import GuesserView from './GuesserView'
import WordReveal from './WordReveal'
import Scoreboard from './Scoreboard'
import ChatPanel from './ChatPanel'
import GuessFeed from './GuessFeed'
import ConnectionStatus from './ConnectionStatus'
import Confetti from 'react-confetti-explosion'

interface Props {
  room: Room
  isDescriber: boolean
  isHost: boolean
  onChooseWord: (word: string) => Promise<void>
  onSetCustomWord: (word: string) => Promise<void>
  onSkipWords: () => Promise<void>
  onSubmitDescription: (text: string) => Promise<void>
  onSubmitGuess: (word: string) => Promise<void>
  onSendChatMessage: (message: string) => Promise<void>
  onEndGame: () => Promise<void>
  onGiveUp: () => Promise<void>
  onLeave: () => Promise<void>
}

export default function GameBoard({
  room,
  isDescriber,
  isHost,
  onChooseWord,
  onSetCustomWord,
  onSkipWords,
  onSubmitDescription,
  onSubmitGuess,
  onSendChatMessage,
  onEndGame,
  onGiveUp,
  onLeave,
}: Props) {
  const [showConfetti, setShowConfetti] = useState(false)
  const prevCorrectGuesses = useRef<Set<string>>(new Set())

  const guesses = room.guesses || {}
  const guessesList = Object.values(guesses)

  useEffect(() => {
    const currentCorrectIds = new Set(guessesList.filter(g => g.correct).map(g => g.id))
    if (currentCorrectIds.size > prevCorrectGuesses.current.size) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
    prevCorrectGuesses.current = currentCorrectIds
  }, [guesses])

  const historyKey = `round${room.currentRound}`
  const currentHistory = room.wordHistory?.[historyKey] || null
  const players = Object.values(room.players)
  const describerId = room.playerOrder[room.currentDescriberIndex]

  return (
    <div className="min-h-screen flex flex-col">
      {showConfetti && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <Confetti particleCount={100} width={400} />
        </div>
      )}

      <ConnectionStatus players={players} />

      <div className="flex justify-between items-center px-3 pt-1.5">
        <button onClick={onLeave}
          className="text-xs font-medium text-danger hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg border border-danger/30 hover:border-danger/60">
          Exit Game
        </button>
        {isHost && (
          <button onClick={onEndGame}
            className="text-xs text-text-muted hover:text-danger transition-colors px-2.5 py-1 rounded-lg border border-border hover:border-danger/50">
            End Game
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-2 p-2 max-w-7xl mx-auto w-full">
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <Scoreboard
            players={players} describerId={describerId}
            currentRound={room.currentRound} totalRounds={room.settings.totalRounds}
          />

          <div className="bg-surface rounded-xl flex-1 flex flex-col min-h-[300px] overflow-hidden">
            {room.state === 'choosing' && isDescriber && (
              <DescriberView
                word="" wordOptions={room.wordOptions || []} category={room.currentCategory}
                descriptions="" state="choosing"
                onChooseWord={onChooseWord} onSetCustomWord={onSetCustomWord}
                onSkipWords={onSkipWords} onSubmitDescription={async () => {}} onGiveUp={async () => {}} guesses={{}}
              />
            )}

            {room.state === 'describing' && isDescriber && (
              <DescriberView
                word={room.currentWord} wordOptions={room.wordOptions || []} category={room.currentCategory}
                descriptions={room.descriptions || ''} state="describing"
                onChooseWord={onChooseWord} onSetCustomWord={onSetCustomWord}
                onSkipWords={async () => {}} onSubmitDescription={onSubmitDescription} onGiveUp={onGiveUp} guesses={guesses}
              />
            )}

            {room.state === 'choosing' && !isDescriber && (
              <div className="flex items-center justify-center p-6 animate-fade-in">
                <p className="text-text-muted text-sm">
                  {room.currentCategory ? `Describer is choosing a word...` : 'Describer is choosing...'}
                </p>
              </div>
            )}

            {(room.state === 'describing' || room.state === 'choosing') && !isDescriber && (
              <GuesserView
                category={room.currentCategory} currentWord={room.currentWord}
                descriptions={room.descriptions || ''} state={room.state}
                onSubmitGuess={onSubmitGuess} guesses={guesses}
              />
            )}

            {room.state === 'revealing' && (
              <WordReveal word={room.currentWord} category={room.currentCategory} history={currentHistory} />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:w-72">
          <div className="bg-surface rounded-xl overflow-hidden h-48 lg:h-56 flex flex-col">
            <GuessFeed guesses={guesses} />
          </div>
          <div className="bg-surface rounded-xl overflow-hidden flex-1 lg:flex-none lg:h-48 flex flex-col">
            <ChatPanel messages={room.chatMessages || {}} onSend={onSendChatMessage} />
          </div>
        </div>
      </div>
    </div>
  )
}
