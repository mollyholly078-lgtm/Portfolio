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
  roomCode: string
  isDescriber: boolean
  isHost: boolean
  onChooseWord: (word: string) => Promise<void>
  onSetCustomWord: (word: string) => Promise<void>
  onSkipWords: () => Promise<void>
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
  roomCode,
  isDescriber,
  isHost,
  onChooseWord,
  onSetCustomWord,
  onSkipWords,
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
  const [showScoreboard, setShowScoreboard] = useState(false)
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
    <div className="h-dvh flex flex-col overflow-hidden" style={{ background: 'var(--color-bg)' }}>
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
          <button onClick={() => setShowScoreboard(true)}
            aria-label="Show scoreboard"
            className="flex items-center justify-center transition-colors rounded-lg lg:hidden"
            style={{
              width: '36px',
              height: '36px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              minHeight: '36px',
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
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
          <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
            #{roomCode}
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

      {/* Scoreboard overlay */}
      {showScoreboard && (
        <div className="fixed inset-0 z-50" style={{ animation: 'fade-in 0.2s ease-out' }}>
          <div onClick={() => setShowScoreboard(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.5)',
            }}
          />
          <div
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, width: '300px', maxWidth: '85vw',
              background: 'var(--color-bg)',
              boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
              zIndex: 51,
              overflowY: 'auto',
              animation: 'slide-in-left 0.25s ease-out',
            }}
          >
            <div className="flex items-center justify-between p-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Scoreboard</span>
              <button onClick={() => setShowScoreboard(false)}
                className="flex items-center justify-center rounded-full transition-colors"
                style={{
                  width: '32px', height: '32px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  minHeight: '32px',
                }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="p-3">
              <Scoreboard
                players={players} describerId={describerId}
                currentRound={room.currentRound} totalRounds={room.settings.totalRounds}
              />
              <div className="flex flex-col gap-2 mt-4" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                <button onClick={() => { setShowScoreboard(false); onLeave() }}
                  className="text-sm font-medium transition-colors px-3 py-2 rounded-lg w-full"
                  style={{
                    color: 'var(--color-wrong)',
                    border: '1px solid rgba(224, 92, 92, 0.3)',
                    background: 'transparent',
                    minHeight: '44px',
                  }}>
                  Exit Game
                </button>
                {isHost && (
                  <button onClick={() => { setShowScoreboard(false); onEndGame() }}
                    className="text-sm transition-colors px-3 py-2 rounded-lg w-full"
                    style={{
                      color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                      background: 'transparent',
                      minHeight: '44px',
                    }}>
                    End Game
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0 py-2">

        <div className="flex flex-col lg:flex-row gap-2 max-w-7xl mx-auto flex-1 min-h-0">

          <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-y-visible">
            <div
              style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
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

              {!['choosing', 'describing', 'revealing'].includes(room.state) && (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    Waiting for game to start...
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col flex-1 min-h-0 lg:w-80 lg:flex-none">
            <div
              className="flex-1 flex flex-col min-h-0"
              style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
              }}>
              <ActivityFeed
                guesses={guesses}
                chatMessages={room.chatMessages || {}}
                descriptions={room.descriptions}
                onSubmitGuess={onSubmitGuess}
                onSendChatMessage={onSendChatMessage}
                isDescriber={isDescriber}
                roomState={room.state}
                currentWord={room.currentWord}
                describerName={room.players[describerId]?.name}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
