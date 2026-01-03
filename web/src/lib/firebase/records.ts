import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './config'
import {
  Record,
  RecordFirestore,
  recordFromFirestore,
  UpsertRecordInput,
} from '@/lib/types'

const RECORDS_COLLECTION = 'records'

export async function getRecordsForDate(
  userId: string,
  date: string
): Promise<Record[]> {
  const q = query(
    collection(db, RECORDS_COLLECTION),
    where('userId', '==', userId),
    where('date', '==', date)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) =>
    recordFromFirestore(doc.id, doc.data() as RecordFirestore)
  )
}

export async function getRecordsForMission(
  userId: string,
  missionId: string,
  startDate: string,
  endDate: string
): Promise<Record[]> {
  const q = query(
    collection(db, RECORDS_COLLECTION),
    where('userId', '==', userId),
    where('missionId', '==', missionId),
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) =>
    recordFromFirestore(doc.id, doc.data() as RecordFirestore)
  )
}

function generateRecordId(userId: string, missionId: string, date: string): string {
  return `${userId}_${missionId}_${date}`
}

export async function upsertRecord(
  userId: string,
  input: UpsertRecordInput
): Promise<Record> {
  const recordId = generateRecordId(userId, input.missionId, input.date)
  const docRef = doc(db, RECORDS_COLLECTION, recordId)

  const now = Timestamp.now()
  const recordData: RecordFirestore = {
    userId,
    missionId: input.missionId,
    value: input.value,
    date: input.date,
    createdAt: now,
    updatedAt: now,
  }

  await setDoc(
    docRef,
    {
      ...recordData,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  return recordFromFirestore(recordId, recordData)
}

export function getTodayDateString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
