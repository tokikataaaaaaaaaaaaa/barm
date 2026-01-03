import { Timestamp } from 'firebase/firestore'

export interface User {
  id: string
  displayName: string | null
  groupId: string | null
  fcmToken: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserFirestore {
  displayName: string | null
  groupId: string | null
  fcmToken: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export function userFromFirestore(id: string, data: UserFirestore): User {
  return {
    id,
    displayName: data.displayName,
    groupId: data.groupId,
    fcmToken: data.fcmToken,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  }
}

export function userToFirestore(user: Partial<User>): Partial<UserFirestore> {
  const data: Partial<UserFirestore> = {}

  if (user.displayName !== undefined) {
    data.displayName = user.displayName
  }
  if (user.groupId !== undefined) {
    data.groupId = user.groupId
  }
  if (user.fcmToken !== undefined) {
    data.fcmToken = user.fcmToken
  }

  return data
}
