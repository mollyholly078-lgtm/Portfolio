export type GameState = 'waiting' | 'choosing' | 'describing' | 'revealing' | 'finished'

export type Category =
  | 'Countries'
  | 'Food & Drinks'
  | 'Celebrities'
  | 'Objects / Household Items'
  | 'Animals'
  | 'Sports'
  | 'Music & Songs'
  | 'Video Games'
  | 'Nature & Places'

export const CATEGORIES: Category[] = [
  'Countries',
  'Food & Drinks',
  'Celebrities',
  'Objects / Household Items',
  'Animals',
  'Sports',
  'Music & Songs',
  'Video Games',
  'Nature & Places',
]

export const CATEGORY_EMOJIS: Record<Category, string> = {
  'Countries': '🌍',
  'Food & Drinks': '🍕',
  'Celebrities': '🎬',
  'Objects / Household Items': '🏠',
  'Animals': '🐾',
  'Sports': '🏆',
  'Music & Songs': '🎵',
  'Video Games': '🎮',
  'Nature & Places': '🌿',
}

export interface Player {
  id: string
  name: string
  color: string
  score: number
  isHost: boolean
  connected: boolean
}

export interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: number
}

export interface GuessEntry {
  id: string
  playerId: string
  playerName: string
  word: string
  correct: boolean
  timestamp: number
}

export interface RoundHistory {
  word: string
  category: string
  correctGuesserId: string | null
  correctGuesserName: string | null
}

export interface GameSettings {
  totalRounds: number
}

export interface Room {
  hostId: string
  players: Record<string, Player>
  playerOrder: string[]
  state: GameState
  settings: GameSettings
  currentRound: number
  currentDescriberIndex: number
  currentCategory: string
  currentWord: string
  wordOptions: string[]
  descriptions: string
  wordRevealEndTime: number
  turnStartTime: number
  guesses: Record<string, GuessEntry>
  chatMessages: Record<string, ChatMessage>
  wordHistory: Record<string, RoundHistory>
  lastActivity: number
}

export const PLAYER_COLORS = [
  '#6366f1', // indigo
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#8b5cf6', // violet
  '#22c55e', // green
  '#eab308', // yellow
  '#ef4444', // red
]

export const ROUND_OPTIONS = [3, 5, 10] as const
export const TURN_DURATION = 60 // seconds
export const REVEAL_DURATION = 3 // seconds
export const ROOM_CODE_LENGTH = 6
