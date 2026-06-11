import { useEffect, useState, useCallback } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db, configMissing } from './firebase'
import { useGame } from './hooks/useGame'
import HomeScreen from './components/HomeScreen'
import Lobby from './components/Lobby'
import GameBoard from './components/GameBoard'
import FinalResults from './components/FinalResults'
import DarkToggle from './components/DarkToggle'
import type { Room } from './types'

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('catkey_dark_mode')
      if (saved !== null) return saved === 'true'
    } catch {
      // localStorage not available
    }
    return false
  })

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    try { localStorage.setItem('catkey_dark_mode', String(dark)) } catch {
      // localStorage not available
    }
  }, [dark])

  const toggle = useCallback(() => setDark(prev => !prev), [])

  return { dark, toggle }
}

export default function App() {
  const { dark, toggle: toggleDark } = useDarkMode()
  const game = useGame()
  const [roomData, setRoomData] = useState<Room | null>(null)
  const [screen, setScreen] = useState<'home' | 'lobby' | 'game' | 'results'>('home')

  useEffect(() => {
    if (game.room) {
      setRoomData(game.room)
      if (game.room.state === 'waiting') setScreen('lobby')
      else if (game.room.state === 'finished') setScreen('results')
      else setScreen('game')
    }
  }, [game.room])

  useEffect(() => {
    if (!game.roomCode) return
    const r = ref(db, `rooms/${game.roomCode}`)
    const cleanup = onValue(r, (snap) => {
      const data = snap.val()
      if (!data) { setScreen('home'); return }
      if (data.state === 'finished') setScreen('results')
    })
    return () => off(r, 'value', cleanup)
  }, [game.roomCode])

  const handleCreateRoom = useCallback(async (name: string) => {
    const code = await game.createRoom(name)
    setScreen('lobby')
    return code
  }, [game])

  const handleJoinRoom = useCallback(async (code: string, name: string) => {
    await game.joinRoom(code, name)
    setScreen('lobby')
  }, [game])

  const handleStart = useCallback(async (rounds: number, categories: string[]) => {
    await game.startGame({ totalRounds: rounds, selectedCategories: categories })
  }, [game])

  const handleLeave = useCallback(async () => {
    await game.leaveRoom()
    setScreen('home')
  }, [game])

  const handleExitGame = useCallback(async () => {
    await game.leaveRoom()
    setScreen('home')
  }, [game])

  if (configMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-surface rounded-2xl p-8 text-center animate-fade-in">
          <div className="text-5xl mb-4">⚙️</div>
          <h1 className="text-2xl font-bold mb-2">Almost there!</h1>
          <p className="text-text-muted mb-6">
            Create a <code className="bg-surface-light px-2 py-0.5 rounded text-sm">.env</code> file in the <code className="bg-surface-light px-2 py-0.5 rounded text-sm">describe-it/</code> folder based on <code className="bg-surface-light px-2 py-0.5 rounded text-sm">.env.example</code> with your Firebase project credentials.
          </p>
          <ol className="text-left text-sm space-y-2 text-text-muted mb-6">
            <li>1. Go to <a href="https://console.firebase.google.com" target="_blank" className="text-primary hover:underline">Firebase Console</a> and create a project</li>
            <li>2. Enable <strong>Anonymous Authentication</strong></li>
            <li>3. Create a <strong>Realtime Database</strong> (start in test mode)</li>
            <li>4. Copy your config into <code className="bg-surface-light px-1 rounded">describe-it/.env</code></li>
          </ol>
          <p className="text-xs text-text-muted">After setting up, run <code className="bg-surface-light px-1 rounded">npm run dev</code> again</p>
        </div>
      </div>
    )
  }

  if (screen === 'home') {
    return <HomeScreen onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} loading={game.loading} error={game.error} dark={dark} onToggleDark={toggleDark} />
  }

  if (screen === 'lobby' && game.roomCode) {
    return (
      <>
        <DarkToggle dark={dark} onToggle={toggleDark} />
        <Lobby players={game.players} roomCode={game.roomCode} isHost={game.isHost} onStart={handleStart} onLeave={handleLeave} />
      </>
    )
  }

  if (screen === 'results' && roomData) {
    return (
      <>
        <DarkToggle dark={dark} onToggle={toggleDark} />
        <FinalResults players={game.players} wordHistory={roomData.wordHistory || {}} onPlayAgain={game.playAgain} isHost={game.isHost} />
      </>
    )
  }

  if (screen === 'game' && game.roomCode && game.playerId && roomData) {
    return (
      <GameBoard
        room={roomData} isDescriber={game.isDescriber} isHost={game.isHost}
        onChooseWord={game.chooseWord} onSetCustomWord={game.setCustomWord} onSkipWords={game.skipWords}
        onSubmitDescription={game.submitDescription} onSubmitGuess={game.submitGuess}
        onSendChatMessage={game.sendChatMessage} onEndGame={game.endGame} onGiveUp={game.giveUpTurn} onLeave={handleExitGame}
        dark={dark} onToggleDark={toggleDark}
      />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-muted">Loading...</p>
      </div>
    </div>
  )
}


