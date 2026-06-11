import { ref, get, child } from 'firebase/database'
import { db } from '../firebase'
import { ROOM_CODE_LENGTH } from '../types'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCode(): string {
  let code = ''
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}

export async function generateUniqueRoomCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateCode()
    const snapshot = await get(child(ref(db), `rooms/${code}`))
    if (!snapshot.exists()) {
      return code
    }
  }
  throw new Error('Failed to generate unique room code after 10 attempts')
}
