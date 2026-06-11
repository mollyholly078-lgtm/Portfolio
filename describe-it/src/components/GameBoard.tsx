import { useState, useEffect, useRef } from 'react'
import type { Room } from '../types'
import DescriberView from './DescriberView'
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
  playerId: string
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
  playerId,
}: Props) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)
  const [showScoreboard, setShowScoreboard] = useState(false)
  const [showWord, setShowWord] = useState(false)
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

  const revealTime = room.wordRevealEndTime ? Math.max(0, Math.floor((room.wordRevealEndTime - Date.now()) / 1000)) : 0

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {showConfetti && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <Confetti particleCount={100} width={400} />
        </div>
      )}

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

      {/* WhatsApp-style Header */}
      <div
        className="sticky top-0 z-40 flex items-center justify-between px-3"
        style={{
          height: '52px',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={onLeave}
          className="flex items-center justify-center"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: '6px', borderRadius: '8px' }}
          aria-label="Back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <div className="flex items-center gap-2 flex-1 ml-2">
          <span className="font-bold" style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.05rem', color: 'var(--color-primary)' }}>
            Catkey
          </span>
          {room.settings.totalRounds > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>
              {room.currentRound}/{room.settings.totalRounds}
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <ConnectionStatus players={players} />
          {onToggleDark && (
            <button
              onClick={onToggleDark}
              aria-label="Toggle dark mode"
              className="flex items-center justify-center"
              style={{ width: '36px', height: '36px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', borderRadius: '8px' }}
            >
              {dark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          )}
          <button
            onClick={() => setShowScoreboard(true)}
            className="flex items-center justify-center"
            style={{ width: '36px', height: '36px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', borderRadius: '8px' }}
            aria-label="Scoreboard"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Game Status Bar */}
      {room.state !== 'revealing' && room.state !== 'finished' && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 overflow-x-auto"
          style={{
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            minHeight: '40px',
          }}
        >
          {room.state === 'choosing' ? (
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {isDescriber ? 'Pick a word to describe' : 'Describer is picking a word...'}
            </p>
          ) : (
            <>
              <span className="text-xs font-medium shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                {room.currentCategory}
              </span>
              <div className="flex gap-0.5 shrink-0">
                {room.currentWord.split('').map((char, i) => {
                  const isRevealed = showWord || (!/[a-zA-Z0-9]/.test(char))
                  return (
                    <span
                      key={i}
                      className="flex items-center justify-center"
                      style={{
                        width: '1.3rem',
                        height: '1.5rem',
                        borderBottom: /[a-zA-Z0-9]/.test(char) ? '2px solid var(--color-text-muted)' : 'none',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: isRevealed ? 'var(--color-text)' : 'var(--color-text-muted)',
                      }}
                    >
                      {isRevealed ? char : ''}
                    </span>
                  )
                })}
              </div>
              {isDescriber && (
                <button
                  onClick={() => setShowWord(!showWord)}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    background: showWord ? 'rgba(91, 79, 207, 0.15)' : 'rgba(91, 79, 207, 0.08)',
                    color: 'var(--color-primary)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {showWord ? 'Hide' : '👁'}
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={onGiveUp}
                className="text-[10px] font-medium px-2 py-0.5 rounded shrink-0"
                style={{
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                Give Up
              </button>
            </>
          )}
        </div>
      )}

      {/* Reveal Timer Bar */}
      {room.state === 'revealing' && (
        <div className="flex items-center justify-center gap-2 px-3 py-1.5" style={{ background: 'rgba(76, 175, 125, 0.08)', borderBottom: '1px solid var(--color-border)' }}>
          <span className="text-xs font-semibold" style={{ color: 'var(--color-correct)' }}>
            {revealTime > 0 ? `Next round in ${revealTime}s` : 'Advancing...'}
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ animation: 'fade-in 0.3s ease-out' }}>
        {room.state === 'revealing' ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <WordReveal
              word={room.currentWord}
              category={room.currentCategory}
              history={room.wordHistory?.[`round${room.currentRound}`] || null}
            />
          </div>
        ) : (
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
            playerId={playerId}
            players={players}
            describerId={describerId}
          />
        )}
      </div>

      {/* Bottom action bar (reveal state) */}
      {room.state === 'revealing' && (
        <div className="flex justify-center gap-3 px-4 py-2" style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
          <button onClick={onLeave}
            className="text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ color: 'var(--color-wrong)', border: '1px solid rgba(224, 92, 92, 0.3)', background: 'transparent', cursor: 'pointer' }}>
            Exit Game
          </button>
          {isHost && (
            <button onClick={onEndGame}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer' }}>
              End Game
            </button>
          )}
        </div>
      )}

      {/* Scoreboard Drawer */}
      {showScoreboard && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.35)' }} onClick={() => setShowScoreboard(false)} />
          <div
            className="fixed top-0 right-0 h-full z-50 w-72 shadow-xl overflow-y-auto"
            style={{
              background: 'var(--color-surface)',
              animation: 'slide-in-right 0.25s ease-out',
            }}
          >
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="text-sm font-bold" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>Scoreboard</h2>
              <button
                onClick={() => setShowScoreboard(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-3">
              <Scoreboard
                players={players}
                describerId={describerId}
                currentRound={room.currentRound}
                totalRounds={room.settings.totalRounds}
              />
            </div>
          </div>
        </>
      )}

      {/* Describer Word Choice Modal */}
      {room.state === 'choosing' && isDescriber && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => {}} />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-y-auto"
            style={{
              background: 'var(--color-surface)',
              animation: 'slide-up 0.3s ease-out',
              maxHeight: '85vh',
            }}
          >
            <div className="w-10 h-1 rounded-full mx-auto my-3" style={{ background: 'var(--color-border)' }} />
            <DescriberView
              word=""
              wordOptions={room.wordOptions || []}
              category={room.currentCategory}
              state="choosing"
              onChooseWord={onChooseWord}
              onSetCustomWord={onSetCustomWord}
              onSkipWords={onSkipWords}
              onGiveUp={async () => {}}
            />
          </div>
        </>
      )}
    </div>
  )
}
