import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  increment,
  writeBatch,
} from 'firebase/firestore'
import { db } from './config'
import {
  Challenge,
  ChallengeFirestore,
  challengeFromFirestore,
  ChallengeParticipation,
  ChallengeParticipationFirestore,
  participationFromFirestore,
  ChallengeRecord,
  ChallengeRecordFirestore,
  challengeRecordFromFirestore,
  ChallengeTeam,
  ChallengeTeamFirestore,
  teamFromFirestore,
  JoinChallengeInput,
  UpdateGoalInput,
  UpdateNotificationInput,
  UpsertChallengeRecordInput,
  CHALLENGE_DURATION,
} from '@/lib/types'

// Collection names
const CHALLENGES_COLLECTION = 'challenges'
const PARTICIPATIONS_COLLECTION = 'challengeParticipations'
const RECORDS_COLLECTION = 'challengeRecords'
const TEAMS_COLLECTION = 'challengeTeams'

// Default notification time
const DEFAULT_NOTIFICATION_TIME = '20:00'

// ============================================================
// Challenge Operations
// ============================================================

export async function getChallenges(status?: 'upcoming' | 'active'): Promise<Challenge[]> {
  let q
  if (status) {
    q = query(
      collection(db, CHALLENGES_COLLECTION),
      where('status', '==', status),
      orderBy('startDate', 'asc')
    )
  } else {
    q = query(
      collection(db, CHALLENGES_COLLECTION),
      where('status', 'in', ['upcoming', 'active']),
      orderBy('startDate', 'asc')
    )
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) =>
    challengeFromFirestore(doc.id, doc.data() as ChallengeFirestore)
  )
}

export async function getChallenge(challengeId: string): Promise<Challenge | null> {
  const docRef = doc(db, CHALLENGES_COLLECTION, challengeId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return challengeFromFirestore(docSnap.id, docSnap.data() as ChallengeFirestore)
}

// ============================================================
// Participation Operations
// ============================================================

export async function getMyParticipation(
  userId: string,
  challengeId: string
): Promise<ChallengeParticipation | null> {
  const q = query(
    collection(db, PARTICIPATIONS_COLLECTION),
    where('userId', '==', userId),
    where('challengeId', '==', challengeId)
  )

  const snapshot = await getDocs(q)
  if (snapshot.empty) {
    return null
  }

  const doc = snapshot.docs[0]
  return participationFromFirestore(doc.id, doc.data() as ChallengeParticipationFirestore)
}

export async function getMyParticipations(userId: string): Promise<ChallengeParticipation[]> {
  const q = query(
    collection(db, PARTICIPATIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('joinedAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) =>
    participationFromFirestore(doc.id, doc.data() as ChallengeParticipationFirestore)
  )
}

export async function getTeamParticipations(
  teamId: string
): Promise<ChallengeParticipation[]> {
  const q = query(
    collection(db, PARTICIPATIONS_COLLECTION),
    where('teamId', '==', teamId)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) =>
    participationFromFirestore(doc.id, doc.data() as ChallengeParticipationFirestore)
  )
}

export async function joinChallenge(
  userId: string,
  input: JoinChallengeInput
): Promise<ChallengeParticipation> {
  // Validate challenge exists and is joinable
  const challenge = await getChallenge(input.challengeId)
  if (!challenge) {
    throw new Error('チャレンジが見つかりません')
  }
  if (challenge.status !== 'upcoming') {
    throw new Error('このチャレンジには参加できません（開始済みまたは終了済み）')
  }

  // Validate goal input
  if (!input.goal.name || input.goal.name.length > 100) {
    throw new Error('目標名は1〜100文字で入力してください')
  }
  if (input.goal.targetValue <= 0 || input.goal.targetValue > 10000) {
    throw new Error('目標値は1〜10000の範囲で入力してください')
  }
  if (!input.goal.unit || input.goal.unit.length > 20) {
    throw new Error('単位は1〜20文字で入力してください')
  }

  // Check if already participating
  const existing = await getMyParticipation(userId, input.challengeId)
  if (existing) {
    throw new Error('既にこのチャレンジに参加しています')
  }

  // Check if this is user's first challenge (for free tier)
  const myParticipations = await getMyParticipations(userId)
  const isFirstChallenge = myParticipations.length === 0

  const now = Timestamp.now()
  const participationData: ChallengeParticipationFirestore = {
    challengeId: input.challengeId,
    teamId: null, // Will be assigned when challenge starts
    userId,
    goal: input.goal,
    isPaid: isFirstChallenge, // First challenge is free (treated as paid)
    achievedDays: 0,
    notificationTime: input.notificationTime || DEFAULT_NOTIFICATION_TIME,
    notificationEnabled: true,
    joinedAt: now,
  }

  // Use batch to update participation and challenge participant count
  const batch = writeBatch(db)

  const participationRef = doc(collection(db, PARTICIPATIONS_COLLECTION))
  batch.set(participationRef, participationData)

  const challengeRef = doc(db, CHALLENGES_COLLECTION, input.challengeId)
  batch.update(challengeRef, {
    participantCount: increment(1),
  })

  await batch.commit()

  return participationFromFirestore(participationRef.id, participationData)
}

export async function updateGoal(
  participationId: string,
  input: UpdateGoalInput
): Promise<void> {
  const docRef = doc(db, PARTICIPATIONS_COLLECTION, participationId)
  await updateDoc(docRef, {
    goal: input.goal,
  })
}

export async function updateNotification(
  participationId: string,
  input: UpdateNotificationInput
): Promise<void> {
  const docRef = doc(db, PARTICIPATIONS_COLLECTION, participationId)
  await updateDoc(docRef, {
    notificationTime: input.notificationTime,
    notificationEnabled: input.notificationEnabled,
  })
}

export async function withdrawFromChallenge(
  participationId: string,
  challengeId: string
): Promise<void> {
  // Only allowed for upcoming challenges
  const challenge = await getChallenge(challengeId)
  if (!challenge || challenge.status !== 'upcoming') {
    throw new Error('開始後のチャレンジは辞退できません')
  }

  const batch = writeBatch(db)

  const participationRef = doc(db, PARTICIPATIONS_COLLECTION, participationId)
  batch.delete(participationRef)

  const challengeRef = doc(db, CHALLENGES_COLLECTION, challengeId)
  batch.update(challengeRef, {
    participantCount: increment(-1),
  })

  await batch.commit()
}

// ============================================================
// Record Operations
// ============================================================

export async function getRecords(participationId: string): Promise<ChallengeRecord[]> {
  const q = query(
    collection(db, RECORDS_COLLECTION),
    where('participationId', '==', participationId),
    orderBy('date', 'asc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) =>
    challengeRecordFromFirestore(d.id, d.data() as ChallengeRecordFirestore)
  )
}

export async function getRecordsForDate(
  participationIds: string[],
  date: string
): Promise<ChallengeRecord[]> {
  if (participationIds.length === 0) return []

  // Firestore 'in' query supports max 30 items
  const chunks = []
  for (let i = 0; i < participationIds.length; i += 30) {
    chunks.push(participationIds.slice(i, i + 30))
  }

  const results: ChallengeRecord[] = []
  for (const chunk of chunks) {
    const q = query(
      collection(db, RECORDS_COLLECTION),
      where('participationId', 'in', chunk),
      where('date', '==', date)
    )

    const snapshot = await getDocs(q)
    snapshot.docs.forEach((d) => {
      results.push(challengeRecordFromFirestore(d.id, d.data() as ChallengeRecordFirestore))
    })
  }

  return results
}

export async function upsertRecord(
  participationId: string,
  input: UpsertChallengeRecordInput
): Promise<ChallengeRecord> {
  // Validate input
  if (!input.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new Error('日付の形式が不正です')
  }
  if (input.value < 0 || input.value > 100000) {
    throw new Error('記録値は0〜100000の範囲で入力してください')
  }
  if (input.memo && input.memo.length > 500) {
    throw new Error('メモは500文字以内で入力してください')
  }

  // Check if record exists for this date
  const q = query(
    collection(db, RECORDS_COLLECTION),
    where('participationId', '==', participationId),
    where('date', '==', input.date)
  )

  const snapshot = await getDocs(q)

  if (!snapshot.empty) {
    // Update existing record
    const existingDoc = snapshot.docs[0]
    const existingData = existingDoc.data() as ChallengeRecordFirestore

    // Check if achievement status changed
    const wasAchieved = existingData.achieved
    const isNowAchieved = input.achieved

    await updateDoc(existingDoc.ref, {
      value: input.value,
      achieved: input.achieved,
      memo: input.memo || null,
    })

    // Update achievedDays if status changed
    if (wasAchieved !== isNowAchieved) {
      const participationRef = doc(db, PARTICIPATIONS_COLLECTION, participationId)
      await updateDoc(participationRef, {
        achievedDays: increment(isNowAchieved ? 1 : -1),
      })
    }

    return challengeRecordFromFirestore(existingDoc.id, {
      ...existingData,
      value: input.value,
      achieved: input.achieved,
      memo: input.memo,
    })
  } else {
    // Create new record
    const now = Timestamp.now()
    const recordData: ChallengeRecordFirestore = {
      participationId,
      date: input.date,
      value: input.value,
      achieved: input.achieved,
      memo: input.memo,
      createdAt: now,
    }

    const batch = writeBatch(db)

    const recordRef = doc(collection(db, RECORDS_COLLECTION))
    batch.set(recordRef, recordData)

    // Update achievedDays if achieved
    if (input.achieved) {
      const participationRef = doc(db, PARTICIPATIONS_COLLECTION, participationId)
      batch.update(participationRef, {
        achievedDays: increment(1),
      })
    }

    await batch.commit()

    return challengeRecordFromFirestore(recordRef.id, recordData)
  }
}

// ============================================================
// Team Operations
// ============================================================

export async function getTeam(teamId: string): Promise<ChallengeTeam | null> {
  const docRef = doc(db, TEAMS_COLLECTION, teamId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return teamFromFirestore(docSnap.id, docSnap.data() as ChallengeTeamFirestore)
}

export async function getTeamsForChallenge(challengeId: string): Promise<ChallengeTeam[]> {
  const q = query(
    collection(db, TEAMS_COLLECTION),
    where('challengeId', '==', challengeId)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) =>
    teamFromFirestore(doc.id, doc.data() as ChallengeTeamFirestore)
  )
}

// ============================================================
// Helper Functions
// ============================================================

export function getChallengeDays(challenge: Challenge): string[] {
  const days: string[] = []
  const totalDays = CHALLENGE_DURATION[challenge.type]
  const startDate = new Date(challenge.startDate)

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    days.push(date.toISOString().split('T')[0])
  }

  return days
}

export function getRemainingDays(challenge: Challenge): number {
  const now = new Date()
  const endDate = new Date(challenge.endDate)
  const diffTime = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

export function getDaysUntilStart(challenge: Challenge): number {
  const now = new Date()
  const startDate = new Date(challenge.startDate)
  const diffTime = startDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}
