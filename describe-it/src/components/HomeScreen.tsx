import { useState } from 'react'

interface Props {
  onCreateRoom: (name: string) => Promise<string>
  onJoinRoom: (code: string, name: string) => Promise<void>
  loading: boolean
  error: string | null
}

export default function HomeScreen({ onCreateRoom, onJoinRoom, loading, error }: Props) {
  const [mode, setMode] = useState<'create' | 'join' | null>(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

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

  if (!mode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Catkey
            </h1>
            <p className="text-text-muted">A word description guessing game</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full py-4 bg-primary hover:bg-primary-dark rounded-xl text-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Create a Room
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-4 bg-surface hover:bg-surface-light rounded-xl text-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] border border-border"
            >
              Join a Room
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <button
          onClick={() => setMode(null)}
          className="text-text-muted hover:text-text mb-6 flex items-center gap-2 text-sm transition-colors"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold mb-6">
          {mode === 'create' ? 'Create a Room' : 'Join a Room'}
        </h2>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        {mode === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
                maxLength={20}
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-3 bg-primary hover:bg-primary-dark disabled:opacity-50 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
                maxLength={20}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Room Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. XK92PL"
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 font-mono tracking-widest text-center text-lg uppercase"
                maxLength={6}
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !name.trim() || code.length !== 6}
              className="w-full py-3 bg-primary hover:bg-primary-dark disabled:opacity-50 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
