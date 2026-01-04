import { Timestamp } from 'firebase/firestore'

// Challenge Types
export type ChallengeType = '1week' | '2week' | '1month'
export type ChallengeStatus = 'upcoming' | 'active' | 'completed'
export type GoalCategory = 'workout' | 'exercise' | 'study' | 'habit' | 'other'

// Challenge Duration in days
export const CHALLENGE_DURATION: Record<ChallengeType, number> = {
  '1week': 7,
  '2week': 14,
  '1month': 30,
}

// Team size constraints
export const MIN_TEAM_SIZE = 5
export const MAX_TEAM_SIZE = 9

// Result thresholds
export const COMPLETION_THRESHOLD = 0.8 // 80%
export const ALMOST_THRESHOLD = 0.5 // 50%

// Challenge Entity
export interface Challenge {
  id: string
  type: ChallengeType
  startDate: Date
  endDate: Date
  status: ChallengeStatus
  participantCount: number
  createdAt: Date
}

export interface ChallengeFirestore {
  type: ChallengeType
  startDate: Timestamp
  endDate: Timestamp
  status: ChallengeStatus
  participantCount: number
  createdAt: Timestamp
}

export function challengeFromFirestore(id: string, data: ChallengeFirestore): Challenge {
  return {
    id,
    type: data.type,
    startDate: data.startDate.toDate(),
    endDate: data.endDate.toDate(),
    status: data.status,
    participantCount: data.participantCount,
    createdAt: data.createdAt.toDate(),
  }
}

// Team Entity
export interface ChallengeTeam {
  id: string
  challengeId: string
  memberIds: string[]
  createdAt: Date
}

export interface ChallengeTeamFirestore {
  challengeId: string
  memberIds: string[]
  createdAt: Timestamp
}

export function teamFromFirestore(id: string, data: ChallengeTeamFirestore): ChallengeTeam {
  return {
    id,
    challengeId: data.challengeId,
    memberIds: data.memberIds,
    createdAt: data.createdAt.toDate(),
  }
}

// Goal Entity
export interface ChallengeGoal {
  category: GoalCategory
  name: string
  targetValue: number
  unit: string
  icon?: string
}

// Participation Entity
export interface ChallengeParticipation {
  id: string
  challengeId: string
  teamId: string | null
  userId: string
  goal: ChallengeGoal
  isPaid: boolean
  achievedDays: number
  notificationTime: string // HH:MM format
  notificationEnabled: boolean
  joinedAt: Date
}

export interface ChallengeParticipationFirestore {
  challengeId: string
  teamId: string | null
  userId: string
  goal: ChallengeGoal
  isPaid: boolean
  achievedDays: number
  notificationTime: string
  notificationEnabled: boolean
  joinedAt: Timestamp
}

export function participationFromFirestore(
  id: string,
  data: ChallengeParticipationFirestore
): ChallengeParticipation {
  return {
    id,
    challengeId: data.challengeId,
    teamId: data.teamId,
    userId: data.userId,
    goal: data.goal,
    isPaid: data.isPaid,
    achievedDays: data.achievedDays,
    notificationTime: data.notificationTime,
    notificationEnabled: data.notificationEnabled,
    joinedAt: data.joinedAt.toDate(),
  }
}

// Record Entity
export interface ChallengeRecord {
  id: string
  participationId: string
  date: string // YYYY-MM-DD
  value: number
  achieved: boolean
  memo?: string
  createdAt: Date
}

export interface ChallengeRecordFirestore {
  participationId: string
  date: string
  value: number
  achieved: boolean
  memo?: string
  createdAt: Timestamp
}

export function challengeRecordFromFirestore(id: string, data: ChallengeRecordFirestore): ChallengeRecord {
  return {
    id,
    participationId: data.participationId,
    date: data.date,
    value: data.value,
    achieved: data.achieved,
    memo: data.memo,
    createdAt: data.createdAt.toDate(),
  }
}

// Input Types
export interface JoinChallengeInput {
  challengeId: string
  goal: ChallengeGoal
  notificationTime?: string
}

export interface UpdateGoalInput {
  goal: ChallengeGoal
}

export interface UpdateNotificationInput {
  notificationTime: string
  notificationEnabled: boolean
}

export interface UpsertChallengeRecordInput {
  date: string
  value: number
  achieved: boolean
  memo?: string
}

// Derived Types for UI
export interface ParticipantWithRecords {
  participation: ChallengeParticipation
  user: {
    id: string
    displayName: string | null
  }
  records: ChallengeRecord[]
  isCurrentUser: boolean
}

export interface ChallengeResultData {
  achievedDays: number
  totalDays: number
  rank: number
  rankings: {
    userId: string
    displayName: string | null
    achievedDays: number
    totalDays: number
  }[]
}

export type ResultType = 'completed' | 'almost' | 'failed'

export function getResultType(achievedDays: number, totalDays: number): ResultType {
  if (totalDays === 0) return 'failed'
  const rate = achievedDays / totalDays
  if (rate >= COMPLETION_THRESHOLD) return 'completed'
  if (rate >= ALMOST_THRESHOLD) return 'almost'
  return 'failed'
}

// Team Distribution Algorithm
export function distributeToTeams(participantCount: number): number[] {
  if (participantCount < MIN_TEAM_SIZE) {
    return [participantCount]
  }

  if (participantCount <= MAX_TEAM_SIZE) {
    return [participantCount]
  }

  const teamCount = Math.ceil(participantCount / MAX_TEAM_SIZE)
  const baseSize = Math.floor(participantCount / teamCount)
  const remainder = participantCount % teamCount

  return Array.from({ length: teamCount }, (_, i) => baseSize + (i < remainder ? 1 : 0))
}
