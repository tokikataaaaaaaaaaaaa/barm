import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './config'
import {
  Mission,
  MissionFirestore,
  missionFromFirestore,
  CreateMissionInput,
  UpdateMissionInput,
} from '@/lib/types'

const MISSIONS_COLLECTION = 'missions'
const MAX_MISSIONS = 10

export async function getMissions(userId: string): Promise<Mission[]> {
  const q = query(
    collection(db, MISSIONS_COLLECTION),
    where('userId', '==', userId),
    where('isActive', '==', true),
    orderBy('sortOrder', 'asc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) =>
    missionFromFirestore(doc.id, doc.data() as MissionFirestore)
  )
}

export async function getMission(missionId: string): Promise<Mission | null> {
  const docRef = doc(db, MISSIONS_COLLECTION, missionId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return missionFromFirestore(docSnap.id, docSnap.data() as MissionFirestore)
}

export async function createMission(
  userId: string,
  input: CreateMissionInput
): Promise<Mission> {
  // Check mission count
  const existingMissions = await getMissions(userId)
  if (existingMissions.length >= MAX_MISSIONS) {
    throw new Error(`ミッションは最大${MAX_MISSIONS}個までです`)
  }

  const now = Timestamp.now()
  const missionData: MissionFirestore = {
    userId,
    type: input.type,
    name: input.name,
    targetValue: input.targetValue,
    unit: input.unit,
    isActive: true,
    sortOrder: existingMissions.length,
    createdAt: now,
    updatedAt: now,
  }

  const docRef = await addDoc(collection(db, MISSIONS_COLLECTION), missionData)
  return missionFromFirestore(docRef.id, missionData)
}

export async function updateMission(
  missionId: string,
  input: UpdateMissionInput
): Promise<void> {
  const docRef = doc(db, MISSIONS_COLLECTION, missionId)
  await updateDoc(docRef, {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteMission(missionId: string): Promise<void> {
  const docRef = doc(db, MISSIONS_COLLECTION, missionId)
  await deleteDoc(docRef)
}
