import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Check if Firebase config is available (for CI builds without env vars)
const isFirebaseConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId

// Initialize Firebase only if config is valid (singleton pattern)
let _app: FirebaseApp | null = null
let _auth: Auth | null = null
let _db: Firestore | null = null

if (isFirebaseConfigValid) {
  _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  _auth = getAuth(_app)
  _db = getFirestore(_app)
}

// Export getters that return non-null types (will throw at runtime if not initialized)
// This allows type-safe usage while gracefully handling CI builds without env vars
export const auth: Auth = new Proxy({} as Auth, {
  get(_, prop) {
    if (!_auth) {
      // During SSR/build without env vars, return a no-op to prevent crashes
      if (typeof window === 'undefined') {
        return () => Promise.resolve(null)
      }
      throw new Error('Firebase Auth is not initialized. Check your environment variables.')
    }
    return Reflect.get(_auth, prop)
  },
})

export const db: Firestore = new Proxy({} as Firestore, {
  get(_, prop) {
    if (!_db) {
      // During SSR/build without env vars, return a no-op to prevent crashes
      if (typeof window === 'undefined') {
        return () => Promise.resolve(null)
      }
      throw new Error('Firebase Firestore is not initialized. Check your environment variables.')
    }
    return Reflect.get(_db, prop)
  },
})

// Analytics (only in browser)
export const initAnalytics = async () => {
  if (_app && typeof window !== 'undefined' && await isSupported()) {
    return getAnalytics(_app)
  }
  return null
}

export default _app
