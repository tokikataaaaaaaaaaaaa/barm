import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  UserCredential,
} from 'firebase/auth'
import { auth } from './config'

// Apple Sign In Provider
const appleProvider = new OAuthProvider('apple.com')
appleProvider.addScope('email')
appleProvider.addScope('name')

// Sign in with Apple (production)
export async function signInWithApple(): Promise<UserCredential> {
  // Use redirect on mobile for better UX
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  if (isMobile) {
    await signInWithRedirect(auth, appleProvider)
    // This will redirect, so we won't reach here
    // The result will be handled by getAppleRedirectResult
    throw new Error('Redirecting to Apple Sign In')
  }

  return signInWithPopup(auth, appleProvider)
}

// Handle redirect result (call this on app mount)
export async function getAppleRedirectResult(): Promise<UserCredential | null> {
  return getRedirectResult(auth)
}

// Email/Password Sign In (development only)
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password)
}

// Email/Password Sign Up (development only)
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password)
}

// Check if running in development
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

// Anonymous Sign In (skip login)
export async function signInAsGuest(): Promise<UserCredential> {
  return signInAnonymously(auth)
}
