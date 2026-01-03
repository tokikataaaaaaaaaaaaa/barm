import { Timestamp } from 'firebase/firestore'

export interface Group {
  id: string
  name: string
  inviteCode: string
  ownerId: string
  memberCount: number
  createdAt: Date
}

export interface GroupFirestore {
  name: string
  inviteCode: string
  ownerId: string
  memberCount: number
  createdAt: Timestamp
}

export function groupFromFirestore(id: string, data: GroupFirestore): Group {
  return {
    id,
    name: data.name,
    inviteCode: data.inviteCode,
    ownerId: data.ownerId,
    memberCount: data.memberCount,
    createdAt: data.createdAt.toDate(),
  }
}

export interface GroupMember {
  userId: string
  displayName: string
  joinedAt: Date
}

export interface GroupMemberFirestore {
  userId: string
  displayName: string
  joinedAt: Timestamp
}

export function groupMemberFromFirestore(data: GroupMemberFirestore): GroupMember {
  return {
    userId: data.userId,
    displayName: data.displayName,
    joinedAt: data.joinedAt.toDate(),
  }
}

export interface CreateGroupInput {
  name: string
}

export interface MemberRecord {
  userId: string
  displayName: string
  records: {
    missionId: string
    missionName: string
    value: number
    targetValue: number
    completed: boolean
  }[]
  allCompleted: boolean
  streak: number
}

// Constants
export const MAX_GROUP_MEMBERS = 5
export const INVITE_CODE_LENGTH = 6
