import { useState, useEffect, useRef } from 'react'
import type { Room } from '../types'
import DescriberView from './DescriberView'
import GuesserView from './GuesserView'
import WordReveal from './WordReveal'
import Scoreboard from './Scoreboard'
import ActivityFeed from './ActivityFeed'
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
  dark?: boolean
  onToggleDark?: () => void
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
  dark,
  onToggleDark,
}: Props) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)
  const prevCorrectGuesses = useRef<Set<string>>(new Set())

  const guesses = room.guesses || {}
  const guessesList = Object.values(guesses)
  const players = Object.values(room.players)
  const describerId = room.playerOrder[room.currentDescriberIndex]

  useEffect(() => {
    const currentCorrectIds = new Set(guessesList.filter(g => g.correct).map(g => g.id))
    if (currentCorrectIds.size > prevCorrectGuesses.current.size) {
      setShowConfetti(true)
      const correctGuess = guessesList.find(g => g.correct && !prevCorrectGuesses.current.has(g.id))
      if (correctGuess) {
        setSuccessBanner(`${correctGuess.playerName} got it right!`)
        setTimeout(() => setSuccessBanner(null), 2000)
      }
      setTimeout(() => setShowConfetti(false), 3000)
    }
    prevCorrectGuesses.current = currentCorrectIds
  }, [guesses])

  const historyKey = `round${room.currentRound}`
  const currentHistory = room.wordHistory?.[historyKey] || null

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {showConfetti && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <Confetti particleCount={100} width={400} />
        </div>
      )}

      {/* Success Banner */}
      {successBanner && (
        <div
          className="fixed top-0 left-0 right-0 z-50 text-center py-3 font-semibold text-sm"
          style={{
            background: '#4CAF7D',
            color: '#fff',
            animation: 'slide-down-banner 0.3s ease-out',
          }}
        >
          {successBanner}
        </div>
      )}

      {/* Sticky Header HUD */}
      <div
        className="sticky top-0 z-40 flex items-center justify-between px-4"
        style={{
          height: '56px',
          background: 'var(--color-surface)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="font-semibold"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '1rem',
              color: 'var(--color-primary)',
            }}
          >
            Catkey
          </span>
        </div>

        {room.settings.totalRounds > 0 && (
          <div
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Round {room.currentRound}/{room.settings.totalRounds}
          </div>
        )}

        <div className="flex items-center gap-2">
          {onToggleDark && (
            <button
              onClick={onToggleDark}
              aria-label="Toggle dark mode"
              className="flex items-center justify-center transition-colors rounded-full"
              style={{
                width: '36px',
                height: '36px',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                minHeight: '36px',
              }}
            >
              {dark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          )}
          <ConnectionStatus players={players} />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-2 p-2 max-w-7xl mx-auto w-full overflow-hidden" style={{ animation: 'fade-in 0.4s ease-out' }}>
        <div className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">
          <Scoreboard
            players={players} describerId={describerId}
            currentRound={room.currentRound} totalRounds={room.settings.totalRounds}
          />

          <div
            className="flex-1 flex flex-col overflow-hidden"
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              boxShadow: 'var(--shadow-card)',
              minHeight: '300px',
            }}
          >
            {room.state === 'choosing' && isDescriber && (
              <DescriberView
                word="" wordOptions={room.wordOptions || []} category={room.currentCategory}
                state="choosing"
                onChooseWord={onChooseWord} onSetCustomWord={onSetCustomWord}
                onSkipWords={onSkipWords} onGiveUp={async () => {}}
              />
            )}

            {room.state === 'describing' && isDescriber && (
              <DescriberView
                word={room.currentWord} wordOptions={room.wordOptions || []} category={room.currentCategory}
                state="describing"
                onChooseWord={onChooseWord} onSetCustomWord={onSetCustomWord}
                onSkipWords={async () => {}} onGiveUp={onGiveUp}
              />
            )}

            {(room.state === 'describing' || room.state === 'choosing') && !isDescriber && (
              <GuesserView
                category={room.currentCategory} currentWord={room.currentWord}
                state={room.state}
                onSubmitGuess={onSubmitGuess} guesses={guesses}
              />
            )}

            {room.state === 'revealing' && (
              <WordReveal word={room.currentWord} category={room.currentCategory} history={currentHistory} />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:w-80">
          <div
            className="overflow-hidden flex-1 flex flex-col"
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              boxShadow: 'var(--shadow-card)',
              minHeight: '300px',
              maxHeight: '500px',
            }}>
            <ActivityFeed
              guesses={guesses}
              chatMessages={room.chatMessages || {}}
              descriptions={room.descriptions}
              onSubmitGuess={onSubmitGuess}
              onSendChatMessage={onSendChatMessage}
              onSubmitDescription={onSubmitDescription}
              isDescriber={isDescriber}
              roomState={room.state}
              currentWord={room.currentWord}
              describerName={room.players[describerId]?.name}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center px-4 pb-3 pt-1" style={{ borderTop: '1px solid var(--color-border)' }}>
        <button onClick={onLeave}
          className="text-xs font-medium transition-colors px-3 py-1.5 rounded-lg"
          style={{
            color: 'var(--color-wrong)',
            border: '1px solid rgba(224, 92, 92, 0.3)',
            background: 'transparent',
            minHeight: '36px',
          }}>
          Exit Game
        </button>
        {isHost && (
          <button onClick={onEndGame}
            className="text-xs transition-colors px-2.5 py-1 rounded-lg"
            style={{
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              minHeight: '36px',
            }}>
            End Game
          </button>
        )}
      </div>
    </div>
  )
}
