import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './config'
import { User, UserFirestore, userFromFirestore, userToFirestore } from '@/lib/types'

// User Repository
export async function getUser(userId: string): Promise<User | null> {
  const docRef = doc(db, 'users', userId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return userFromFirestore(docSnap.id, docSnap.data() as UserFirestore)
}

export async function createUser(userId: string): Promise<User> {
  const now = Timestamp.now()
  const userData: UserFirestore = {
    displayName: null,
    groupId: null,
    fcmToken: null,
    createdAt: now,
    updatedAt: now,
  }

  const docRef = doc(db, 'users', userId)
  await setDoc(docRef, userData)

  return userFromFirestore(userId, userData)
}

export async function updateUser(
  userId: string,
  data: Partial<User>
): Promise<void> {
  const docRef = doc(db, 'users', userId)
  const updateData = {
    ...userToFirestore(data),
    updatedAt: serverTimestamp(),
  }

  await updateDoc(docRef, updateData)
}

export async function getOrCreateUser(userId: string): Promise<User> {
  const existingUser = await getUser(userId)
  if (existingUser) {
    return existingUser
  }
  return createUser(userId)
}
