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
  timeLeft: number
  onChooseWord: (word: string) => Promise<void>
  onSkipWords: () => Promise<void>
  onSubmitDescription: (text: string) => Promise<void>
  onSubmitGuess: (word: string) => Promise<void>
  onSendChatMessage: (message: string) => Promise<void>
}

export default function GameBoard({
  room,
  isDescriber,
  timeLeft,
  onChooseWord,
  onSkipWords,
  onSubmitDescription,
  onSubmitGuess,
  onSendChatMessage,
}: Props) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [skippedOnce, setSkippedOnce] = useState<boolean>(false)
  const prevCorrectGuesses = useRef<Set<string>>(new Set())

  const guesses = room.guesses || {}
  const guessesList = Object.values(guesses)

  useEffect(() => {
    const currentCorrectIds = new Set(
      guessesList.filter(g => g.correct).map(g => g.id)
    )
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

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto w-full">
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <Scoreboard
            players={players}
            describerId={describerId}
            currentRound={room.currentRound}
            totalRounds={room.settings.totalRounds}
          />

          <div className="bg-surface rounded-xl flex-1 flex flex-col min-h-[400px]">
            {room.state === 'choosing' && isDescriber && (
              <DescriberView
                word=""
                wordOptions={room.wordOptions || []}
                category={room.currentCategory}
                descriptions=""
                timeLeft={timeLeft}
                state="choosing"
            onChooseWord={onChooseWord}
            onSkipWords={async () => { setSkippedOnce(true); await onSkipWords() }}
                onSubmitDescription={async () => {}}
                guesses={{}}
                skippedOnce={skippedOnce}
              />
            )}

            {room.state === 'describing' && isDescriber && (
              <DescriberView
                word={room.currentWord}
                wordOptions={room.wordOptions || []}
                category={room.currentCategory}
                descriptions={room.descriptions || ''}
                timeLeft={timeLeft}
                state="describing"
                onChooseWord={onChooseWord}
                onSkipWords={async () => {}}
                onSubmitDescription={onSubmitDescription}
                guesses={guesses}
                skippedOnce={skippedOnce}
              />
            )}

            {room.state === 'choosing' && !isDescriber && (
              <div className="flex items-center justify-center p-8 animate-fade-in">
                <p className="text-text-muted text-lg">
                  {room.currentCategory
                    ? `Describer is choosing a word (${room.currentCategory})...`
                    : 'Describer is choosing a category...'}
                </p>
              </div>
            )}

            {(room.state === 'describing' || room.state === 'choosing') && !isDescriber && (
              <GuesserView
                category={room.currentCategory}
                currentWord={room.currentWord}
                descriptions={room.descriptions || ''}
                timeLeft={timeLeft}
                state={room.state}
                onSubmitGuess={onSubmitGuess}
                guesses={guesses}

              />
            )}

            {room.state === 'revealing' && (
              <WordReveal
                word={room.currentWord}
                category={room.currentCategory}
                history={currentHistory}
                timeLeft={timeLeft}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:w-80">
          <div className="bg-surface rounded-xl overflow-hidden h-64 lg:h-72 flex flex-col">
            <GuessFeed guesses={guesses} />
          </div>

          <div className="bg-surface rounded-xl overflow-hidden flex-1 lg:flex-none lg:h-64 flex flex-col">
            <ChatPanel
              messages={room.chatMessages || {}}
              onSend={onSendChatMessage}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
