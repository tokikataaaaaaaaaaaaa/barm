'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './use-auth'
import {
  getRecordsForDate,
  getRecordsForMission,
  upsertRecord,
  getTodayDateString,
} from '@/lib/firebase/records'
import { UpsertRecordInput } from '@/lib/types'

export function useTodayRecords() {
  const { firebaseUser } = useAuth()
  const today = getTodayDateString()

  return useQuery({
    queryKey: ['records', firebaseUser?.uid, today],
    queryFn: () => getRecordsForDate(firebaseUser!.uid, today),
    enabled: !!firebaseUser?.uid,
  })
}

export function useRecordsForDate(date: string) {
  const { firebaseUser } = useAuth()

  return useQuery({
    queryKey: ['records', firebaseUser?.uid, date],
    queryFn: () => getRecordsForDate(firebaseUser!.uid, date),
    enabled: !!firebaseUser?.uid && !!date,
  })
}

export function useUpsertRecord() {
  const { firebaseUser } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpsertRecordInput) =>
      upsertRecord(firebaseUser!.uid, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['records', firebaseUser?.uid, variables.date],
      })
      queryClient.invalidateQueries({
        queryKey: ['missionRecords', variables.missionId],
      })
    },
  })
}

export function useMissionRecords(missionId: string, startDate: string, endDate: string) {
  const { firebaseUser } = useAuth()

  return useQuery({
    queryKey: ['missionRecords', missionId, startDate, endDate],
    queryFn: () => getRecordsForMission(firebaseUser!.uid, missionId, startDate, endDate),
    enabled: !!firebaseUser?.uid && !!missionId && !!startDate && !!endDate,
  })
}
