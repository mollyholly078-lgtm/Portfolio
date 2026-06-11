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
      <div
        className="fixed top-0 left-0 right-0 text-white text-center py-2 text-sm font-semibold z-50"
        style={{
          background: 'var(--color-wrong)',
          animation: 'slide-down-banner 0.3s ease-out',
        }}
      >
        Reconnecting...
      </div>
    )
  }

  return (
    <div className="fixed top-2 z-50" style={{ left: '56px' }}>
      <div
        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
        style={{
          background: 'var(--color-surface)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-correct)' }} />
        <span style={{ color: 'var(--color-text-muted)' }}>
          {onlineCount}/{players.length}
        </span>
        <span style={{ color: 'var(--color-text-muted)' }}>online</span>
      </div>
    </div>
  )
}
