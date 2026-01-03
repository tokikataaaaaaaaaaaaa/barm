'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './use-auth'
import {
  createGroup,
  joinGroup,
  leaveGroup,
  deleteGroup,
  getGroup,
  getGroupByInviteCode,
  getGroupMembers,
  getMemberRecords,
} from '@/lib/firebase/groups'
import { CreateGroupInput } from '@/lib/types'

/**
 * Hook for the current user's group
 */
export function useGroup() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['group', user?.groupId],
    queryFn: () => getGroup(user!.groupId!),
    enabled: !!user?.groupId,
  })
}

/**
 * Hook for group members
 */
export function useGroupMembers() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['groupMembers', user?.groupId],
    queryFn: () => getGroupMembers(user!.groupId!),
    enabled: !!user?.groupId,
  })
}

/**
 * Hook for members' records on a specific date
 */
export function useMemberRecords(date: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['memberRecords', user?.groupId, date],
    queryFn: () => getMemberRecords(user!.groupId!, date),
    enabled: !!user?.groupId && !!date,
  })
}

/**
 * Hook for creating a group
 */
export function useCreateGroup() {
  const { firebaseUser } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => createGroup(firebaseUser!.uid, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group'] })
      queryClient.invalidateQueries({ queryKey: ['groupMembers'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

/**
 * Hook for joining a group with invite code
 */
export function useJoinGroup() {
  const { firebaseUser } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteCode: string) => joinGroup(firebaseUser!.uid, inviteCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group'] })
      queryClient.invalidateQueries({ queryKey: ['groupMembers'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

/**
 * Hook for leaving a group
 */
export function useLeaveGroup() {
  const { firebaseUser, user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => leaveGroup(firebaseUser!.uid, user!.groupId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group'] })
      queryClient.invalidateQueries({ queryKey: ['groupMembers'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

/**
 * Hook for deleting a group (owner only)
 */
export function useDeleteGroup() {
  const { firebaseUser, user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteGroup(firebaseUser!.uid, user!.groupId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group'] })
      queryClient.invalidateQueries({ queryKey: ['groupMembers'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

/**
 * Hook for validating an invite code
 */
export function useValidateInviteCode() {
  return useMutation({
    mutationFn: (inviteCode: string) => getGroupByInviteCode(inviteCode),
  })
}
