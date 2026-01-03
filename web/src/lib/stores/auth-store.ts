import { create } from 'zustand'
import { User } from '@/lib/types'

interface AuthState {
  user: User | null
  firebaseUser: { uid: string; email: string | null } | null
  isLoading: boolean
  isAuthenticated: boolean
  hasDisplayName: boolean
  setUser: (user: User | null) => void
  setFirebaseUser: (firebaseUser: { uid: string; email: string | null } | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  firebaseUser: null,
  isLoading: true,
  isAuthenticated: false,
  hasDisplayName: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
      hasDisplayName: user?.displayName !== null && user?.displayName !== '',
    }),

  setFirebaseUser: (firebaseUser) =>
    set({
      firebaseUser,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () =>
    set({
      user: null,
      firebaseUser: null,
      isLoading: false,
      isAuthenticated: false,
      hasDisplayName: false,
    }),
}))
