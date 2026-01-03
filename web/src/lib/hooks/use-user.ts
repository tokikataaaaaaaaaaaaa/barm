'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUser } from '@/lib/firebase/firestore'
import { useAuthStore } from '@/lib/stores/auth-store'
import { User } from '@/lib/types'

export function useUpdateUser() {
  const queryClient = useQueryClient()
  const { user, setUser } = useAuthStore()

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string
      data: Partial<User>
    }) => {
      await updateUser(userId, data)
      return data
    },
    onSuccess: (data) => {
      // Update the local auth store with the new user data
      if (user) {
        setUser({
          ...user,
          ...data,
          updatedAt: new Date(),
        })
      }
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}
