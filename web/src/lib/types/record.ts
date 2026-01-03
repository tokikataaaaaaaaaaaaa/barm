import { Timestamp } from 'firebase/firestore'

export interface Record {
  id: string
  userId: string
  missionId: string
  value: number
  date: string // YYYY-MM-DD format
  createdAt: Date
  updatedAt: Date
}

export interface RecordFirestore {
  userId: string
  missionId: string
  value: number
  date: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export function recordFromFirestore(id: string, data: RecordFirestore): Record {
  return {
    id,
    userId: data.userId,
    missionId: data.missionId,
    value: data.value,
    date: data.date,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  }
}

export interface UpsertRecordInput {
  missionId: string
  value: number
  date: string
}
