'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './use-auth'
import {
  getMissions,
  getMission,
  createMission,
  updateMission,
  deleteMission,
} from '@/lib/firebase/missions'
import { CreateMissionInput, UpdateMissionInput } from '@/lib/types'

export function useMissions() {
  const { firebaseUser } = useAuth()

  return useQuery({
    queryKey: ['missions', firebaseUser?.uid],
    queryFn: () => getMissions(firebaseUser!.uid),
    enabled: !!firebaseUser?.uid,
  })
}

export function useMission(missionId: string) {
  const { firebaseUser } = useAuth()

  return useQuery({
    queryKey: ['mission', missionId],
    queryFn: () => getMission(missionId),
    enabled: !!firebaseUser?.uid && !!missionId,
  })
}

export function useCreateMission() {
  const { firebaseUser } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateMissionInput) =>
      createMission(firebaseUser!.uid, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] })
    },
  })
}

export function useUpdateMission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      missionId,
      input,
    }: {
      missionId: string
      input: UpdateMissionInput
    }) => updateMission(missionId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] })
    },
  })
}

export function useDeleteMission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (missionId: string) => deleteMission(missionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] })
    },
  })
}
