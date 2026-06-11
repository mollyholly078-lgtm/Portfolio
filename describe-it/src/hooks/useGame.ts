import { useState, useEffect, useCallback, useRef } from 'react'
import { ref, onValue, off, update, push, set, get, child, remove } from 'firebase/database'
import { db, setupPresence, setupLastActivity } from '../firebase'
import { generateUniqueRoomCode } from '../utils/roomCode'
import { getFallbackWords } from '../utils/words'

import type {
  Room, Player, Category, ChatMessage,
  GuessEntry,
} from '../types'
import { CATEGORIES, PLAYER_COLORS, REVEAL_DURATION } from '../types'
import { generateWords } from '../utils/claude'
import { isCorrectGuess } from '../utils/levenshtein'

interface GameOptions {
  totalRounds: number
  timerDuration: number
  selectedCategories: string[]
}

interface UseGameReturn {
  room: Room | null
  roomCode: string | null
  loading: boolean
  error: string | null

  playerId: string | null
  playerName: string
  setPlayerName: (name: string) => void

  createRoom: (playerName: string) => Promise<string>
  joinRoom: (code: string, playerName: string) => Promise<void>
  leaveRoom: () => Promise<void>
  startGame: (options: GameOptions) => Promise<void>
  chooseWord: (word: string) => Promise<void>
  setCustomWord: (word: string) => Promise<void>
  skipWords: () => Promise<void>
  submitDescription: (text: string) => Promise<void>
  submitGuess: (word: string) => Promise<void>
  sendChatMessage: (message: string) => Promise<void>
  playAgain: () => Promise<void>
  endGame: () => Promise<void>

  isHost: boolean
  isDescriber: boolean
  players: Player[]
  describerId: string | null
  timeLeft: number
  turnDuration: number
}

export function useGame(): UseGameReturn {
  const [room, setRoom] = useState<Room | null>(null)
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [timeLeft, setTimeLeft] = useState(60)
  const [uid, setUid] = useState<string | null>(null)
  const [turnDuration, setTurnDuration] = useState(60)

  const currentUid = useRef<string | null>(null)
  const timerHandled = useRef<Record<string, boolean>>({})

  useEffect(() => {
    const stored = sessionStorage.getItem('catkey_uid')
    if (stored) {
      currentUid.current = stored
      setUid(stored)
      setPlayerId(stored)
    }
  }, [])

  useEffect(() => {
    if (!roomCode || !uid) return

    const r = ref(db, `rooms/${roomCode}`)

    const cleanup = onValue(r, (snapshot) => {
      const data = snapshot.val()
      if (!data) {
        setRoom(null)
        setError('Room no longer exists')
        return
      }

      const roomData: Room = {
        ...data,
        players: data.players || {},
        playerOrder: data.playerOrder || [],
        guesses: data.guesses || {},
        chatMessages: data.chatMessages || {},
        wordHistory: data.wordHistory || {},
        wordOptions: data.wordOptions || [],
      }

      setRoom(roomData)
      setupPresence(roomCode, uid)
      setupLastActivity(roomCode)

      const dur = data.settings?.timerDuration || 60
      setTurnDuration(dur)

      if (data.state === 'describing' || data.state === 'choosing') {
        const elapsed = (Date.now() - (data.turnStartTime || Date.now())) / 1000
        const remaining = Math.max(0, dur - elapsed)
        setTimeLeft(Math.ceil(remaining))
      }

      if (data.state === 'revealing' && data.wordRevealEndTime) {
        const remaining = Math.max(0, Math.ceil((data.wordRevealEndTime - Date.now()) / 1000))
        setTimeLeft(remaining)
      }
    })

    return () => off(r, 'value', cleanup)
  }, [roomCode, uid])

  useEffect(() => {
    if (!room || !uid) return
    const dur = room.settings?.timerDuration || 60

    if (room.state === 'describing') {
      const interval = setInterval(() => {
        const elapsed = (Date.now() - (room.turnStartTime || Date.now())) / 1000
        const remaining = Math.max(0, dur - elapsed)
        setTimeLeft(Math.ceil(remaining))
      }, 1000)
      return () => clearInterval(interval)
    }

    if (room.state === 'revealing' && room.wordRevealEndTime) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((room.wordRevealEndTime - Date.now()) / 1000))
        setTimeLeft(remaining)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [room?.state, room?.turnStartTime, room?.wordRevealEndTime, uid, room?.settings?.timerDuration])

  useEffect(() => {
    if (!roomCode || !room || timeLeft > 0) return

    if (room.state === 'describing' && !timerHandled.current[`describing_${room.currentRound}_${room.currentDescriberIndex}`]) {
      timerHandled.current[`describing_${room.currentRound}_${room.currentDescriberIndex}`] = true
      update(ref(db), {
        [`rooms/${roomCode}/state`]: 'revealing',
        [`rooms/${roomCode}/wordRevealEndTime`]: Date.now() + REVEAL_DURATION * 1000,
        [`rooms/${roomCode}/wordHistory/round${room.currentRound}`]: {
          word: room.currentWord,
          category: room.currentCategory,
          correctGuesserId: null,
          correctGuesserName: null,
        },
      }).catch(console.error)
    }

    if (room.state === 'revealing' && !timerHandled.current[`revealing_${room.currentRound}_${room.currentDescriberIndex}`]) {
      timerHandled.current[`revealing_${room.currentRound}_${room.currentDescriberIndex}`] = true
      advanceToNextTurn(roomCode, room)
    }
  }, [timeLeft, room?.state, roomCode])

  async function advanceToNextTurn(roomCode: string, room: Room) {
    const playerOrder = room.playerOrder
    const nextDescriberIndex = (room.currentDescriberIndex + 1) % playerOrder.length
    const nextRound = nextDescriberIndex === 0 ? room.currentRound + 1 : room.currentRound

    if (nextRound > room.settings.totalRounds) {
      await update(ref(db), { [`rooms/${roomCode}/state`]: 'finished' })
      return
    }

    const categories = room.settings?.selectedCategories?.length
      ? room.settings.selectedCategories
      : CATEGORIES
    const category = categories[Math.floor(Math.random() * categories.length)] as Category
    const words = await generateWords(category).catch(() => getFallbackWords(category, 3))

    await update(ref(db), {
      [`rooms/${roomCode}/state`]: 'choosing',
      [`rooms/${roomCode}/currentRound`]: nextRound,
      [`rooms/${roomCode}/currentDescriberIndex`]: nextDescriberIndex,
      [`rooms/${roomCode}/currentCategory`]: category,
      [`rooms/${roomCode}/currentWord`]: '',
      [`rooms/${roomCode}/wordOptions`]: words,
      [`rooms/${roomCode}/descriptions`]: '',
      [`rooms/${roomCode}/turnStartTime`]: Date.now(),
      [`rooms/${roomCode}/guesses`]: {},
    })
  }

  useEffect(() => {
    if (room?.state === 'describing') {
      timerHandled.current = {}
    }
  }, [room?.state, room?.currentRound, room?.currentDescriberIndex])

  const createRoom = useCallback(async (name: string): Promise<string> => {
    setLoading(true)
    setError(null)
    try {
      const uidVal = currentUid.current || crypto.randomUUID()
      if (!currentUid.current) {
        currentUid.current = uidVal
        sessionStorage.setItem('catkey_uid', uidVal)
        setUid(uidVal)
        setPlayerId(uidVal)
      }
      setPlayerName(name)

      const code = await generateUniqueRoomCode()
      setRoomCode(code)

      const player: Player = {
        id: uidVal,
        name,
        color: PLAYER_COLORS[0],
        score: 0,
        isHost: true,
        connected: true,
      }

      const initialRoom: Room = {
        hostId: uidVal,
        players: { [uidVal]: player },
        playerOrder: [uidVal],
        state: 'waiting',
        settings: { totalRounds: 3, timerDuration: 60, selectedCategories: [...CATEGORIES] },
        currentRound: 0,
        currentDescriberIndex: 0,
        currentCategory: '',
        currentWord: '',
        wordOptions: [],
        descriptions: '',
        wordRevealEndTime: 0,
        turnStartTime: 0,
        guesses: {},
        chatMessages: {},
        wordHistory: {},
        lastActivity: Date.now(),
      }

      await set(ref(db, `rooms/${code}`), initialRoom)
      return code
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const joinRoom = useCallback(async (code: string, name: string) => {
    setLoading(true)
    setError(null)
    try {
      const codeUpper = code.toUpperCase()
      const snapshot = await get(child(ref(db), `rooms/${codeUpper}`))
      if (!snapshot.exists()) {
        throw new Error('Room not found')
      }

      const roomData = snapshot.val() as Room
      const playerCount = Object.keys(roomData.players || {}).length
      if (playerCount >= 4) {
        throw new Error('Room is full (max 4 players)')
      }
      if (roomData.state !== 'waiting') {
        throw new Error('Game already in progress')
      }

      const uidVal = currentUid.current || crypto.randomUUID()
      if (!currentUid.current) {
        currentUid.current = uidVal
        sessionStorage.setItem('catkey_uid', uidVal)
        setUid(uidVal)
        setPlayerId(uidVal)
      }
      setPlayerName(name)
      setRoomCode(codeUpper)

      const usedColors = Object.values(roomData.players || {}).map(p => p.color)
      const availableColor = PLAYER_COLORS.find(c => !usedColors.includes(c)) || PLAYER_COLORS[playerCount % PLAYER_COLORS.length]

      const player: Player = {
        id: uidVal,
        name,
        color: availableColor,
        score: 0,
        isHost: false,
        connected: true,
      }

      await update(ref(db), {
        [`rooms/${codeUpper}/players/${uidVal}`]: player,
        [`rooms/${codeUpper}/playerOrder/${playerCount}`]: uidVal,
      })
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const leaveRoom = useCallback(async () => {
    if (!roomCode || !uid || !room) return

    try {
      const roomRef_ = ref(db, `rooms/${roomCode}`)
      const snapshot = await get(roomRef_)
      if (!snapshot.exists()) return

      const data = snapshot.val()
      const players = data.players || {}
      const playerOrder: string[] = data.playerOrder || []

      if (data.state === 'waiting') {
        const wasHost = data.hostId === uid

        const remainingPlayers = { ...players }
        delete remainingPlayers[uid]
        const remainingOrder = playerOrder.filter((id: string) => id !== uid)

        if (Object.keys(remainingPlayers).length === 0) {
          await remove(ref(db, `rooms/${roomCode}`))
          return
        }

        const updates: Record<string, any> = {}
        updates[`rooms/${roomCode}/players`] = remainingPlayers
        updates[`rooms/${roomCode}/playerOrder`] = remainingOrder

        if (wasHost && remainingOrder.length > 0) {
          updates[`rooms/${roomCode}/hostId`] = remainingOrder[0]
          updates[`rooms/${roomCode}/players/${remainingOrder[0]}/isHost`] = true
        }

        await update(ref(db), updates)
      } else {
        await update(ref(db), {
          [`rooms/${roomCode}/players/${uid}/connected`]: false,
        })
      }
    } catch (err: any) {
      console.error('Leave room error:', err)
    }
  }, [roomCode, uid, room])

  const startGame = useCallback(async (options: GameOptions) => {
    if (!roomCode || !uid) return
    setError(null)
    try {
      const updates: Record<string, any> = {}
      updates[`rooms/${roomCode}/state`] = 'choosing'
      updates[`rooms/${roomCode}/currentRound`] = 1
      updates[`rooms/${roomCode}/currentDescriberIndex`] = 0
      updates[`rooms/${roomCode}/settings/totalRounds`] = options.totalRounds
      updates[`rooms/${roomCode}/settings/timerDuration`] = options.timerDuration
      updates[`rooms/${roomCode}/settings/selectedCategories`] = options.selectedCategories
      updates[`rooms/${roomCode}/turnStartTime`] = Date.now()
      updates[`rooms/${roomCode}/currentCategory`] = ''
      updates[`rooms/${roomCode}/currentWord`] = ''
      updates[`rooms/${roomCode}/wordOptions`] = []
      updates[`rooms/${roomCode}/descriptions`] = ''

      const playerOrderRef = await get(child(ref(db), `rooms/${roomCode}/playerOrder`))
      const playerOrder: string[] = playerOrderRef.val() || []

      if (playerOrder[0]) {
        const cats = options.selectedCategories?.length ? options.selectedCategories : CATEGORIES
        const category = cats[Math.floor(Math.random() * cats.length)] as Category
        const words = await generateWords(category)
        updates[`rooms/${roomCode}/currentCategory`] = category
        updates[`rooms/${roomCode}/wordOptions`] = words

        await update(ref(db), updates)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }, [roomCode, uid])

  const chooseWord = useCallback(async (word: string) => {
    if (!roomCode || !uid) return
    try {
      await update(ref(db), {
        [`rooms/${roomCode}/currentWord`]: word,
        [`rooms/${roomCode}/state`]: 'describing',
        [`rooms/${roomCode}/turnStartTime`]: Date.now(),
        [`rooms/${roomCode}/descriptions`]: '',
        [`rooms/${roomCode}/guesses`]: {},
      })
    } catch (err: any) {
      setError(err.message)
    }
  }, [roomCode, uid])

  const setCustomWord = useCallback(async (word: string) => {
    if (!roomCode || !uid || !room) return
    try {
      await update(ref(db), {
        [`rooms/${roomCode}/currentWord`]: word,
        [`rooms/${roomCode}/state`]: 'describing',
        [`rooms/${roomCode}/turnStartTime`]: Date.now(),
        [`rooms/${roomCode}/descriptions`]: '',
        [`rooms/${roomCode}/guesses`]: {},
        [`rooms/${roomCode}/wordOptions`]: [word, ...(room.wordOptions?.slice(1) || [])],
      })
    } catch (err: any) {
      setError(err.message)
    }
  }, [roomCode, uid, room])

  const skipWords = useCallback(async () => {
    if (!roomCode || !uid || !room) return
    try {
      const categories = room.settings?.selectedCategories?.length
        ? room.settings.selectedCategories
        : CATEGORIES
      const category = categories[Math.floor(Math.random() * categories.length)] as Category
      const words = await generateWords(category)
      await update(ref(db), {
        [`rooms/${roomCode}/currentCategory`]: category,
        [`rooms/${roomCode}/wordOptions`]: words,
      })
    } catch (err: any) {
      setError(err.message)
    }
  }, [roomCode, uid, room])

  const submitDescription = useCallback(async (text: string) => {
    if (!roomCode || !uid || !room) return
    try {
      const current = room.descriptions || ''
      const updated = current ? `${current}\n${text}` : text
      await set(ref(db, `rooms/${roomCode}/descriptions`), updated)
    } catch (err: any) {
      setError(err.message)
    }
  }, [roomCode, uid, room])

  const submitGuess = useCallback(async (word: string) => {
    if (!roomCode || !uid || !room || !playerName) return

    const guessEntry: GuessEntry = {
      id: `${Date.now()}_${uid}`,
      playerId: uid,
      playerName,
      word: word.trim(),
      correct: false,
      timestamp: Date.now(),
    }

    if (room.state === 'describing' && room.currentWord) {
      guessEntry.correct = isCorrectGuess(word, room.currentWord)
    }

    try {
      const guessRef = push(ref(db, `rooms/${roomCode}/guesses`))
      await set(guessRef, guessEntry)

      if (guessEntry.correct) {
        const describerId = room.playerOrder[room.currentDescriberIndex]
        await update(ref(db), {
          [`rooms/${roomCode}/state`]: 'revealing',
          [`rooms/${roomCode}/wordRevealEndTime`]: Date.now() + REVEAL_DURATION * 1000,
          [`rooms/${roomCode}/players/${uid}/score`]: (room.players[uid]?.score || 0) + 1,
          [`rooms/${roomCode}/players/${describerId}/score`]: (room.players[describerId]?.score || 0) + 0.5,
          [`rooms/${roomCode}/wordHistory/round${room.currentRound}`]: {
            word: room.currentWord,
            category: room.currentCategory,
            correctGuesserId: uid,
            correctGuesserName: playerName,
          },
          [`rooms/${roomCode}/guesses/${guessRef.key}/correct`]: true,
        })
      }
    } catch (err: any) {
      setError(err.message)
    }
  }, [roomCode, uid, room, playerName])

  const sendChatMessage = useCallback(async (message: string) => {
    if (!roomCode || !uid || !playerName) return
    try {
      const msg: ChatMessage = {
        id: `${Date.now()}_${uid}`,
        playerId: uid,
        playerName,
        message: message.trim(),
        timestamp: Date.now(),
      }
      const chatRef = push(ref(db, `rooms/${roomCode}/chatMessages`))
      await set(chatRef, msg)
    } catch (err: any) {
      setError(err.message)
    }
  }, [roomCode, uid, playerName])

  const playAgain = useCallback(async () => {
    if (!roomCode || !uid || !room) return
    try {
      const updates: Record<string, any> = {}
      updates[`rooms/${roomCode}/state`] = 'waiting'
      updates[`rooms/${roomCode}/currentRound`] = 0
      updates[`rooms/${roomCode}/currentDescriberIndex`] = 0
      updates[`rooms/${roomCode}/currentCategory`] = ''
      updates[`rooms/${roomCode}/currentWord`] = ''
      updates[`rooms/${roomCode}/wordOptions`] = []
      updates[`rooms/${roomCode}/descriptions`] = ''
      updates[`rooms/${roomCode}/wordRevealEndTime`] = 0
      updates[`rooms/${roomCode}/turnStartTime`] = 0
      updates[`rooms/${roomCode}/guesses`] = {}
      updates[`rooms/${roomCode}/wordHistory`] = {}

      const playerRef = await get(child(ref(db), `rooms/${roomCode}/players`))
      const players = playerRef.val() || {}
      for (const pid of Object.keys(players)) {
        updates[`rooms/${roomCode}/players/${pid}/score`] = 0
      }

      await update(ref(db), updates)
    } catch (err: any) {
      setError(err.message)
    }
  }, [roomCode, uid, room])

  const endGame = useCallback(async () => {
    if (!roomCode || !uid) return
    try {
      await update(ref(db), {
        [`rooms/${roomCode}/state`]: 'finished',
      })
    } catch (err: any) {
      setError(err.message)
    }
  }, [roomCode, uid])

  const players = room ? Object.values(room.players) : []
  const isHost = uid ? room?.hostId === uid : false
  const describerId = room ? room.playerOrder[room.currentDescriberIndex] : null
  const isDescriber = uid === describerId

  return {
    room,
    roomCode,
    loading,
    error,
    playerId,
    playerName,
    setPlayerName,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    chooseWord,
    setCustomWord,
    skipWords,
    submitDescription,
    submitGuess,
    sendChatMessage,
    playAgain,
    endGame,
    isHost,
    isDescriber,
    players,
    describerId,
    timeLeft,
    turnDuration,
  }
}
