'use client'

import { useEffect } from 'react'
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { useAuthStore } from '@/lib/stores/auth-store'
import { getOrCreateUser } from '@/lib/firebase/firestore'

export function useAuth() {
  const {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated,
    hasDisplayName,
    setUser,
    setFirebaseUser,
    setLoading,
    reset,
  } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser({ uid: fbUser.uid, email: fbUser.email })
        try {
          const profile = await getOrCreateUser(fbUser.uid)
          setUser(profile)
        } catch (error) {
          console.error('Error fetching user profile:', error)
          // Firestore failed, but auth succeeded - create a minimal user object
          setUser({
            id: fbUser.uid,
            displayName: fbUser.displayName || 'ゲスト',
            groupId: null,
            fcmToken: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }
      } else {
        setFirebaseUser(null)
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setFirebaseUser, setLoading])

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      reset()
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated,
    hasDisplayName,
    signOut,
  }
}
