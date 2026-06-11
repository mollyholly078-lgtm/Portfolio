import { useState, useEffect } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '../firebase'
import type { Player } from '../types'

interface Props {
  players: Player[]
}

export default function ConnectionStatus({ players }: Props) {
  const [connected, setConnected] = useState(true)
  const [onlineCount, setOnlineCount] = useState(0)

  useEffect(() => {
    const infoRef = ref(db, '.info/connected')
    const cleanup = onValue(infoRef, (snap) => {
      setConnected(snap.val() === true)
    })
    return () => off(infoRef, 'value', cleanup)
  }, [])

  useEffect(() => {
    setOnlineCount(players.filter(p => p.connected).length)
  }, [players])

  if (!connected) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-danger text-white text-center py-2 text-sm font-semibold z-50 animate-slide-up">
        Reconnecting...
      </div>
    )
  }

  return (
    <div className="fixed top-2 right-2 z-50">
      <div className="flex items-center gap-2 bg-surface/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs">
        <div className="w-2 h-2 rounded-full bg-success" />
        <span className="text-text-muted">
          {onlineCount}/{players.length}
        </span>
        <span className="text-text-muted">online</span>
      </div>
    </div>
  )
}
