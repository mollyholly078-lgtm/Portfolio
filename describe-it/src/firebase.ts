import { initializeApp, getApps } from 'firebase/app'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { getDatabase, ref, set, onDisconnect, serverTimestamp } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const hasConfig = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key'

let app: any = null
let auth: any = null
let db: any = null

if (hasConfig && !getApps().length) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getDatabase(app)
}

const configMissing = !hasConfig

function signInAnonymouslyOnce(): Promise<typeof auth.currentUser> {
  if (!auth) return Promise.resolve(null)
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user: any) => {
      if (user) {
        unsubscribe()
        resolve(user)
      } else {
        signInAnonymously(auth).then((cred: any) => {
          resolve(cred.user)
        }).catch(reject)
      }
    }, reject)
  })
}

function setupPresence(roomCode: string, playerId: string) {
  if (!db) return
  const presenceRef = ref(db, `rooms/${roomCode}/players/${playerId}/connected`)
  set(presenceRef, true)
  onDisconnect(presenceRef).set(false)
}

function setupLastActivity(roomCode: string) {
  if (!db) return
  const activityRef = ref(db, `rooms/${roomCode}/lastActivity`)
  set(activityRef, serverTimestamp())
  onDisconnect(activityRef).set(serverTimestamp())
}

export { app, auth, db, configMissing, signInAnonymouslyOnce, setupPresence, setupLastActivity }
