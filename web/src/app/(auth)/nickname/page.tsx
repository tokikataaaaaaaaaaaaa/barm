'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { updateUser } from '@/lib/firebase/firestore'
import { useAuth } from '@/lib/hooks/use-auth'
import { useAuthStore } from '@/lib/stores/auth-store'

const nicknameSchema = z.object({
  displayName: z
    .string()
    .min(1, '名前を入力してください')
    .max(20, '20文字以内で入力してください')
    .regex(/^\S.*\S$|^\S$/, '前後に空白を含めることはできません'),
})

type NicknameForm = z.infer<typeof nicknameSchema>

export default function NicknamePage() {
  const router = useRouter()
  const { firebaseUser } = useAuth()
  const setUser = useAuthStore((state) => state.setUser)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NicknameForm>({
    resolver: zodResolver(nicknameSchema),
  })

  const onSubmit = async (data: NicknameForm) => {
    if (!firebaseUser) {
      router.push('/login')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await updateUser(firebaseUser.uid, { displayName: data.displayName })

      // Update local state
      setUser({
        id: firebaseUser.uid,
        displayName: data.displayName,
        groupId: null,
        fcmToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      router.push('/home')
    } catch (err) {
      console.error('Error saving nickname:', err)
      setError('保存に失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ニックネームを設定</CardTitle>
          <CardDescription>
            グループで表示される名前を設定してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                {...register('displayName')}
                placeholder="例: タロウ"
                maxLength={20}
              />
              {errors.displayName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            {error && (
              <p className="text-center text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  保存中...
                </>
              ) : (
                '始める'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
