import { Timestamp } from 'firebase/firestore'

export type MissionType = 'workout' | 'study'

export interface Mission {
  id: string
  userId: string
  type: MissionType
  name: string
  targetValue: number
  unit: string
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface MissionFirestore {
  userId: string
  type: MissionType
  name: string
  targetValue: number
  unit: string
  isActive: boolean
  sortOrder: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export function missionFromFirestore(id: string, data: MissionFirestore): Mission {
  return {
    id,
    userId: data.userId,
    type: data.type,
    name: data.name,
    targetValue: data.targetValue,
    unit: data.unit,
    isActive: data.isActive,
    sortOrder: data.sortOrder,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  }
}

export interface CreateMissionInput {
  type: MissionType
  name: string
  targetValue: number
  unit: string
}

export interface UpdateMissionInput {
  name?: string
  targetValue?: number
  unit?: string
  isActive?: boolean
  sortOrder?: number
}
