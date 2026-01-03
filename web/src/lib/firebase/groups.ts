import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  runTransaction,
  writeBatch,
} from 'firebase/firestore'
import { db } from './config'
import {
  Group,
  GroupFirestore,
  groupFromFirestore,
  GroupMember,
  GroupMemberFirestore,
  groupMemberFromFirestore,
  MAX_GROUP_MEMBERS,
  INVITE_CODE_LENGTH,
  MemberRecord,
} from '@/lib/types'

const GROUPS_COLLECTION = 'groups'
const MEMBERS_SUBCOLLECTION = 'members'
const USERS_COLLECTION = 'users'
const MISSIONS_COLLECTION = 'missions'
const RECORDS_COLLECTION = 'records'

const MAX_GROUP_NAME_LENGTH = 50

// Invite code characters (uppercase alphanumeric, excluding ambiguous chars like 0/O, 1/I/L)
const INVITE_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/**
 * Generate a unique 6-character invite code
 */
export function generateInviteCode(): string {
  let code = ''
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * INVITE_CODE_CHARS.length)
    code += INVITE_CODE_CHARS[randomIndex]
  }
  return code
}

/**
 * Validate invite code format
 */
export function isValidInviteCode(code: string): boolean {
  if (code.length !== INVITE_CODE_LENGTH) {
    return false
  }
  return /^[A-Z0-9]{6}$/.test(code)
}

/**
 * Check if user belongs to a group
 */
async function getUserGroupId(userId: string): Promise<string | null> {
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId))
  if (!userDoc.exists()) {
    return null
  }
  return userDoc.data().groupId || null
}

/**
 * Create a new group
 */
export async function createGroup(userId: string, name: string): Promise<Group> {
  // Validate name
  if (!name || name.trim().length === 0) {
    throw new Error('Group name is required')
  }
  if (name.length > MAX_GROUP_NAME_LENGTH) {
    throw new Error(`Group name must be ${MAX_GROUP_NAME_LENGTH} characters or less`)
  }

  // Check if user already belongs to a group
  const existingGroupId = await getUserGroupId(userId)
  if (existingGroupId) {
    throw new Error('You are already a member of a group')
  }

  // Get user display name
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId))
  const displayName = userDoc.exists() ? userDoc.data().displayName || 'Unknown' : 'Unknown'

  // Generate unique invite code
  let inviteCode: string
  let codeExists = true
  while (codeExists) {
    inviteCode = generateInviteCode()
    const existingGroup = await getGroupByInviteCode(inviteCode)
    codeExists = existingGroup !== null
  }

  const now = Timestamp.now()
  const groupRef = doc(collection(db, GROUPS_COLLECTION))
  const groupId = groupRef.id

  const groupData: GroupFirestore = {
    name: name.trim(),
    inviteCode: inviteCode!,
    ownerId: userId,
    memberCount: 1,
    createdAt: now,
  }

  const memberData: GroupMemberFirestore = {
    userId,
    displayName,
    joinedAt: now,
  }

  // Use batch write for atomicity
  const batch = writeBatch(db)
  batch.set(groupRef, groupData)
  batch.set(doc(db, GROUPS_COLLECTION, groupId, MEMBERS_SUBCOLLECTION, userId), memberData)
  batch.update(doc(db, USERS_COLLECTION, userId), { groupId })
  await batch.commit()

  return groupFromFirestore(groupId, groupData)
}

/**
 * Join a group using invite code
 */
export async function joinGroup(userId: string, inviteCode: string): Promise<Group> {
  // Validate invite code format
  if (!isValidInviteCode(inviteCode)) {
    throw new Error('Invalid invite code format')
  }

  // Check if user already belongs to a group
  const existingGroupId = await getUserGroupId(userId)
  if (existingGroupId) {
    throw new Error('You are already a member of a group')
  }

  // Find group by invite code
  const group = await getGroupByInviteCode(inviteCode)
  if (!group) {
    throw new Error('Invalid invite code')
  }

  // Check member limit
  if (group.memberCount >= MAX_GROUP_MEMBERS) {
    throw new Error('Group is full')
  }

  // Get user display name
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId))
  const displayName = userDoc.exists() ? userDoc.data().displayName || 'Unknown' : 'Unknown'

  const now = Timestamp.now()
  const memberData: GroupMemberFirestore = {
    userId,
    displayName,
    joinedAt: now,
  }

  // Use batch write for atomicity
  const batch = writeBatch(db)
  batch.set(doc(db, GROUPS_COLLECTION, group.id, MEMBERS_SUBCOLLECTION, userId), memberData)
  batch.update(doc(db, GROUPS_COLLECTION, group.id), {
    memberCount: group.memberCount + 1,
  })
  batch.update(doc(db, USERS_COLLECTION, userId), { groupId: group.id })
  await batch.commit()

  return {
    ...group,
    memberCount: group.memberCount + 1,
  }
}

/**
 * Leave a group
 */
export async function leaveGroup(userId: string, groupId: string): Promise<void> {
  // Verify user is a member of this group
  const userGroupId = await getUserGroupId(userId)
  if (userGroupId !== groupId) {
    throw new Error('You are not a member of this group')
  }

  // Get group to check ownership
  const group = await getGroup(groupId)
  if (!group) {
    throw new Error('Group not found')
  }

  // Check if user is owner
  if (group.ownerId === userId && group.memberCount > 1) {
    throw new Error('Owner cannot leave the group while other members exist')
  }

  // Use batch write for atomicity
  const batch = writeBatch(db)
  batch.delete(doc(db, GROUPS_COLLECTION, groupId, MEMBERS_SUBCOLLECTION, userId))
  batch.update(doc(db, GROUPS_COLLECTION, groupId), {
    memberCount: group.memberCount - 1,
  })
  batch.update(doc(db, USERS_COLLECTION, userId), { groupId: null })

  // If owner is the last member, delete the group
  if (group.ownerId === userId && group.memberCount === 1) {
    batch.delete(doc(db, GROUPS_COLLECTION, groupId))
  }

  await batch.commit()
}

/**
 * Delete a group (owner only)
 */
export async function deleteGroup(userId: string, groupId: string): Promise<void> {
  // Get group
  const group = await getGroup(groupId)
  if (!group) {
    throw new Error('Group not found')
  }

  // Verify ownership
  if (group.ownerId !== userId) {
    throw new Error('Only the owner can delete the group')
  }

  // Check if there are other members
  if (group.memberCount > 1) {
    throw new Error('Cannot delete group with other members')
  }

  // Use batch write for atomicity
  const batch = writeBatch(db)
  batch.delete(doc(db, GROUPS_COLLECTION, groupId, MEMBERS_SUBCOLLECTION, userId))
  batch.delete(doc(db, GROUPS_COLLECTION, groupId))
  batch.update(doc(db, USERS_COLLECTION, userId), { groupId: null })
  await batch.commit()
}

/**
 * Get a group by ID
 */
export async function getGroup(groupId: string): Promise<Group | null> {
  const docRef = doc(db, GROUPS_COLLECTION, groupId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return groupFromFirestore(docSnap.id, docSnap.data() as GroupFirestore)
}

/**
 * Get a group by invite code
 */
export async function getGroupByInviteCode(inviteCode: string): Promise<Group | null> {
  const q = query(
    collection(db, GROUPS_COLLECTION),
    where('inviteCode', '==', inviteCode)
  )

  const snapshot = await getDocs(q)
  if (snapshot.empty) {
    return null
  }

  const docSnap = snapshot.docs[0]
  return groupFromFirestore(docSnap.id, docSnap.data() as GroupFirestore)
}

/**
 * Get all members of a group
 */
export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const q = query(
    collection(db, GROUPS_COLLECTION, groupId, MEMBERS_SUBCOLLECTION),
    orderBy('joinedAt', 'asc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) =>
    groupMemberFromFirestore(doc.data() as GroupMemberFirestore)
  )
}

/**
 * Get all members' records for a specific date
 */
export async function getMemberRecords(
  groupId: string,
  date: string
): Promise<MemberRecord[]> {
  // Get all group members
  const members = await getGroupMembers(groupId)

  const memberRecords: MemberRecord[] = []

  for (const member of members) {
    // Get user's active missions
    const missionsQuery = query(
      collection(db, MISSIONS_COLLECTION),
      where('userId', '==', member.userId),
      where('isActive', '==', true)
    )
    const missionsSnapshot = await getDocs(missionsQuery)
    const missions = missionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Get user's records for the date
    const recordsQuery = query(
      collection(db, RECORDS_COLLECTION),
      where('userId', '==', member.userId),
      where('date', '==', date)
    )
    const recordsSnapshot = await getDocs(recordsQuery)
    const recordsMap = new Map<string, number>()
    recordsSnapshot.docs.forEach((doc) => {
      const data = doc.data()
      recordsMap.set(data.missionId, data.value)
    })

    // Build record status for each mission
    const records = missions.map((mission: any) => {
      const value = recordsMap.get(mission.id) || 0
      return {
        missionId: mission.id,
        missionName: mission.name,
        value,
        targetValue: mission.targetValue,
        completed: value >= mission.targetValue,
      }
    })

    // Check if all missions are completed
    const allCompleted = records.length > 0 && records.every((r) => r.completed)

    // Calculate streak (simplified - just checking consecutive days)
    const streak = await calculateStreak(member.userId)

    memberRecords.push({
      userId: member.userId,
      displayName: member.displayName,
      records,
      allCompleted,
      streak,
    })
  }

  return memberRecords
}

/**
 * Calculate streak (consecutive days with all missions completed)
 */
async function calculateStreak(userId: string): Promise<number> {
  // Get user's active missions
  const missionsQuery = query(
    collection(db, MISSIONS_COLLECTION),
    where('userId', '==', userId),
    where('isActive', '==', true)
  )
  const missionsSnapshot = await getDocs(missionsQuery)

  if (missionsSnapshot.empty) {
    return 0
  }

  const missionIds = missionsSnapshot.docs.map((doc) => doc.id)
  const missionTargets = new Map<string, number>()
  missionsSnapshot.docs.forEach((doc) => {
    missionTargets.set(doc.id, doc.data().targetValue)
  })

  let streak = 0
  const today = new Date()

  // Check up to 365 days back
  for (let daysBack = 0; daysBack < 365; daysBack++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - daysBack)
    const dateString = formatDate(checkDate)

    // Get records for this date
    const recordsQuery = query(
      collection(db, RECORDS_COLLECTION),
      where('userId', '==', userId),
      where('date', '==', dateString)
    )
    const recordsSnapshot = await getDocs(recordsQuery)

    // Check if all missions are completed for this date
    let allCompleted = true
    for (const missionId of missionIds) {
      const record = recordsSnapshot.docs.find(
        (doc) => doc.data().missionId === missionId
      )
      const value = record ? record.data().value : 0
      const target = missionTargets.get(missionId) || 0

      if (value < target) {
        allCompleted = false
        break
      }
    }

    if (allCompleted) {
      streak++
    } else if (daysBack > 0) {
      // If not the first day (today) and not completed, streak is broken
      break
    }
  }

  return streak
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
