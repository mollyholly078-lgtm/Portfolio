import { useState } from 'react'
import DarkToggle from './DarkToggle'

interface Props {
  onCreateRoom: (name: string) => Promise<string>
  onJoinRoom: (code: string, name: string) => Promise<void>
  loading: boolean
  error: string | null
  dark?: boolean
  onToggleDark?: () => void
}

export default function HomeScreen({ onCreateRoom, onJoinRoom, loading, error, dark, onToggleDark }: Props) {
  const [screen, setScreen] = useState<'splash' | 'create' | 'join'>('splash')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [bestScore] = useState(() => {
    try { return parseInt(localStorage.getItem('catkey_best_score') || '0') } catch { return 0 }
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreateRoom(name.trim())
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) return
    onJoinRoom(code.trim().toUpperCase(), name.trim())
  }

  if (screen === 'create') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-6" style={{ background: 'var(--color-bg)' }}>
        <div className="w-full max-w-md" style={{ animation: 'slide-up 0.4s ease-out' }}>
          <button
            onClick={() => setScreen('splash')}
            className="flex items-center gap-2 text-sm mb-8 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            Back
          </button>

          <h2 className="text-2xl mb-6" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>Create a Room</h2>

          {error && (
            <div className="text-sm rounded-lg p-3 mb-4" style={{ background: 'rgba(224, 92, 92, 0.1)', border: '1px solid rgba(224, 92, 92, 0.3)', color: 'var(--color-wrong)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full"
                style={{
                  background: 'var(--color-surface)',
                  border: '2px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  fontSize: '1.1rem',
                  fontFamily: "'Nunito', sans-serif",
                  outline: 'none',
                  color: 'var(--color-text)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(91, 79, 207, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
                maxLength={20}
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full font-bold"
              style={{
                background: loading || !name.trim() ? 'var(--color-primary)' : 'var(--color-primary)',
                opacity: loading || !name.trim() ? 0.5 : 1,
                color: '#fff',
                borderRadius: 'var(--radius-btn)',
                padding: '14px 32px',
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                border: 'none',
                cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
                transition: 'transform 0.08s ease',
              }}
              onMouseDown={(e) => {
                if (!loading && name.trim()) (e.target as HTMLButtonElement).style.transform = 'scale(0.96)';
              }}
              onMouseUp={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'scale(1)';
              }}
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (screen === 'join') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-6" style={{ background: 'var(--color-bg)' }}>
        <div className="w-full max-w-md" style={{ animation: 'slide-up 0.4s ease-out' }}>
          <button
            onClick={() => setScreen('splash')}
            className="flex items-center gap-2 text-sm mb-8 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            Back
          </button>

          <h2 className="text-2xl mb-6" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>Join a Room</h2>

          {error && (
            <div className="text-sm rounded-lg p-3 mb-4" style={{ background: 'rgba(224, 92, 92, 0.1)', border: '1px solid rgba(224, 92, 92, 0.3)', color: 'var(--color-wrong)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full"
                style={{
                  background: 'var(--color-surface)',
                  border: '2px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  fontSize: '1.1rem',
                  fontFamily: "'Nunito', sans-serif",
                  outline: 'none',
                  color: 'var(--color-text)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(91, 79, 207, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
                maxLength={20}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Room Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. XK92"
                className="w-full font-mono tracking-widest text-center text-lg uppercase"
                style={{
                  background: 'var(--color-surface)',
                  border: '2px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  fontSize: '1.1rem',
                  fontFamily: "'Nunito', sans-serif",
                  outline: 'none',
                  color: 'var(--color-text)',
                  letterSpacing: '0.3em',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(91, 79, 207, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
                maxLength={4}
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !name.trim() || code.length !== 4}
              className="w-full font-bold"
              style={{
                background: 'var(--color-primary)',
                opacity: loading || !name.trim() || code.length !== 4 ? 0.5 : 1,
                color: '#fff',
                borderRadius: 'var(--radius-btn)',
                padding: '14px 32px',
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                border: 'none',
                cursor: loading || !name.trim() || code.length !== 4 ? 'not-allowed' : 'pointer',
                transition: 'transform 0.08s ease',
              }}
              onMouseDown={(e) => {
                if (!loading && name.trim() && code.length === 4) (e.target as HTMLButtonElement).style.transform = 'scale(0.96)';
              }}
              onMouseUp={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'scale(1)';
              }}
            >
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-6"
      style={{
        background: 'var(--color-bg)',
        animation: 'fade-in 0.4s ease-out',
      }}
    >
      {dark !== undefined && onToggleDark && <DarkToggle dark={dark} onToggle={onToggleDark} />}
      <div className="w-full max-w-sm text-center">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '2.5rem',
              fontWeight: 900,
              color: 'var(--color-primary)',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Catkey
          </h1>
        </div>

        <p
          className="mb-8"
          style={{
            color: 'var(--color-text-muted)',
            fontSize: '1rem',
          }}
        >
          Guess the word from the clue
        </p>

        <div className="space-y-3">
          <button
            onClick={() => setScreen('create')}
            className="w-full"
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-btn)',
              padding: '16px 32px',
              fontSize: '1.1rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(91, 79, 207, 0.35)',
              transition: 'transform 0.08s ease, box-shadow 0.2s ease',
              minHeight: '52px',
            }}
            onMouseDown={(e) => {
              const el = e.target as HTMLButtonElement;
              el.style.transform = 'scale(0.96)';
              el.style.boxShadow = '0 2px 8px rgba(91, 79, 207, 0.25)';
            }}
            onMouseUp={(e) => {
              const el = e.target as HTMLButtonElement;
              el.style.transform = 'scale(1)';
              el.style.boxShadow = '0 4px 14px rgba(91, 79, 207, 0.35)';
            }}
            onMouseLeave={(e) => {
              const el = e.target as HTMLButtonElement;
              el.style.transform = 'scale(1)';
              el.style.boxShadow = '0 4px 14px rgba(91, 79, 207, 0.35)';
            }}
          >
            Play Now
          </button>

          <button
            onClick={() => setScreen('join')}
            className="w-full"
            style={{
              background: 'transparent',
              color: 'var(--color-primary)',
              border: '2px solid var(--color-primary)',
              borderRadius: 'var(--radius-btn)',
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.08s ease, background 0.2s ease',
              minHeight: '52px',
            }}
            onMouseDown={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'scale(0.96)';
            }}
            onMouseUp={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'scale(1)';
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = 'rgba(91, 79, 207, 0.08)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'scale(1)';
              (e.target as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            Join a Room
          </button>
        </div>

        {bestScore > 0 && (
          <button
            className="mt-6 flex items-center justify-center gap-2 mx-auto transition-colors"
            style={{
              background: 'rgba(245, 166, 35, 0.1)',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '0.875rem',
              color: 'var(--color-accent)',
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: '44px',
            }}
            onClick={() => {
              const text = `Catkey Best Score: ${bestScore} points!`;
              navigator.clipboard.writeText(text).then(() => {
                const el = document.activeElement as HTMLButtonElement;
                const orig = el.textContent;
                el.textContent = '✓ Copied!';
                setTimeout(() => { el.textContent = orig; }, 1500);
              }).catch(() => {});
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 6 9 6 9z"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 18 9 18 9z"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
            </svg>
            Best Score: {bestScore}
          </button>
        )}
      </div>
    </div>
  )
}
