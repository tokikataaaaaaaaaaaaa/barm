'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './use-auth'
import {
  getChallenges,
  getChallenge,
  getMyParticipation,
  getMyParticipations,
  getTeamParticipations,
  joinChallenge,
  updateGoal,
  updateNotification,
  withdrawFromChallenge,
  getRecords,
  upsertRecord,
  getChallengeDays,
  getRemainingDays,
  getDaysUntilStart,
} from '@/lib/firebase/challenges'
import {
  Challenge,
  ChallengeParticipation,
  ChallengeRecord,
  JoinChallengeInput,
  UpdateGoalInput,
  UpdateNotificationInput,
  UpsertChallengeRecordInput,
} from '@/lib/types'

// Query Keys
export const challengeKeys = {
  all: ['challenges'] as const,
  lists: () => [...challengeKeys.all, 'list'] as const,
  list: (status?: 'upcoming' | 'active') => [...challengeKeys.lists(), { status }] as const,
  details: () => [...challengeKeys.all, 'detail'] as const,
  detail: (id: string) => [...challengeKeys.details(), id] as const,
  participations: () => [...challengeKeys.all, 'participations'] as const,
  participation: (userId: string, challengeId: string) =>
    [...challengeKeys.participations(), userId, challengeId] as const,
  myParticipations: (userId: string) => [...challengeKeys.participations(), 'my', userId] as const,
  teamParticipations: (teamId: string) =>
    [...challengeKeys.participations(), 'team', teamId] as const,
  records: () => [...challengeKeys.all, 'records'] as const,
  recordsForParticipation: (participationId: string) =>
    [...challengeKeys.records(), participationId] as const,
}

// ============================================================
// Challenge Queries
// ============================================================

export function useChallenges(status?: 'upcoming' | 'active') {
  return useQuery({
    queryKey: challengeKeys.list(status),
    queryFn: () => getChallenges(status),
  })
}

export function useChallenge(challengeId: string) {
  return useQuery({
    queryKey: challengeKeys.detail(challengeId),
    queryFn: () => getChallenge(challengeId),
    enabled: !!challengeId,
  })
}

// ============================================================
// Participation Queries
// ============================================================

export function useMyParticipation(challengeId: string) {
  const { firebaseUser } = useAuth()

  return useQuery({
    queryKey: challengeKeys.participation(firebaseUser?.uid || '', challengeId),
    queryFn: () => getMyParticipation(firebaseUser!.uid, challengeId),
    enabled: !!firebaseUser?.uid && !!challengeId,
  })
}

export function useMyParticipations() {
  const { firebaseUser } = useAuth()

  return useQuery({
    queryKey: challengeKeys.myParticipations(firebaseUser?.uid || ''),
    queryFn: () => getMyParticipations(firebaseUser!.uid),
    enabled: !!firebaseUser?.uid,
  })
}

export function useTeamParticipations(teamId: string | null) {
  return useQuery({
    queryKey: challengeKeys.teamParticipations(teamId || ''),
    queryFn: () => getTeamParticipations(teamId!),
    enabled: !!teamId,
  })
}

// ============================================================
// Participation Mutations
// ============================================================

export function useJoinChallenge() {
  const { firebaseUser } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Omit<JoinChallengeInput, 'userId'>) =>
      joinChallenge(firebaseUser!.uid, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: challengeKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: challengeKeys.participation(firebaseUser!.uid, variables.challengeId),
      })
      queryClient.invalidateQueries({
        queryKey: challengeKeys.myParticipations(firebaseUser!.uid),
      })
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      participationId,
      input,
    }: {
      participationId: string
      input: UpdateGoalInput
    }) => updateGoal(participationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: challengeKeys.participations() })
    },
  })
}

export function useUpdateNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      participationId,
      input,
    }: {
      participationId: string
      input: UpdateNotificationInput
    }) => updateNotification(participationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: challengeKeys.participations() })
    },
  })
}

export function useWithdrawFromChallenge() {
  const { firebaseUser } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      participationId,
      challengeId,
    }: {
      participationId: string
      challengeId: string
    }) => withdrawFromChallenge(participationId, challengeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: challengeKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: challengeKeys.participation(firebaseUser!.uid, variables.challengeId),
      })
      queryClient.invalidateQueries({
        queryKey: challengeKeys.myParticipations(firebaseUser!.uid),
      })
    },
  })
}

// ============================================================
// Record Queries & Mutations
// ============================================================

export function useRecords(participationId: string) {
  return useQuery({
    queryKey: challengeKeys.recordsForParticipation(participationId),
    queryFn: () => getRecords(participationId),
    enabled: !!participationId,
  })
}

export function useUpsertRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      participationId,
      input,
    }: {
      participationId: string
      input: UpsertChallengeRecordInput
    }) => upsertRecord(participationId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: challengeKeys.recordsForParticipation(variables.participationId),
      })
      queryClient.invalidateQueries({ queryKey: challengeKeys.participations() })
    },
  })
}

// ============================================================
// Helper Hooks
// ============================================================

export function useChallengeWithParticipation(challengeId: string) {
  const challengeQuery = useChallenge(challengeId)
  const participationQuery = useMyParticipation(challengeId)

  return {
    challenge: challengeQuery.data,
    participation: participationQuery.data,
    isLoading: challengeQuery.isLoading || participationQuery.isLoading,
    error: challengeQuery.error || participationQuery.error,
  }
}

export function useChallengeProgress(challenge: Challenge | null | undefined) {
  if (!challenge) {
    return {
      totalDays: 0,
      remainingDays: 0,
      daysUntilStart: 0,
      challengeDays: [],
      isStarted: false,
      isCompleted: false,
    }
  }

  const challengeDays = getChallengeDays(challenge)
  const remainingDays = getRemainingDays(challenge)
  const daysUntilStart = getDaysUntilStart(challenge)

  return {
    totalDays: challengeDays.length,
    remainingDays,
    daysUntilStart,
    challengeDays,
    isStarted: challenge.status === 'active' || challenge.status === 'completed',
    isCompleted: challenge.status === 'completed',
  }
}
