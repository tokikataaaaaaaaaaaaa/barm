'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { useCreateMission } from '@/lib/hooks/use-missions'
import { MissionType } from '@/lib/types'
import { cn } from '@/lib/utils'

const missionSchema = z.object({
  name: z
    .string()
    .min(1, 'ミッション名を入力してください')
    .max(50, '50文字以内で入力してください'),
  targetValue: z
    .number({ invalid_type_error: '数値を入力してください' })
    .min(1, '1以上の値を入力してください')
    .max(9999, '9999以下の値を入力してください'),
  unit: z
    .string()
    .min(1, '単位を入力してください')
    .max(10, '10文字以内で入力してください'),
})

type MissionForm = z.infer<typeof missionSchema>

const PRESET_UNITS = ['回', '分', 'ページ', 'km', 'セット']

export default function CreateMissionPage() {
  const router = useRouter()
  const createMission = useCreateMission()
  const [selectedType, setSelectedType] = useState<MissionType>('workout')
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MissionForm>({
    resolver: zodResolver(missionSchema),
    defaultValues: {
      unit: '回',
    },
  })

  const currentUnit = watch('unit')

  const onSubmit = async (data: MissionForm) => {
    setError(null)
    try {
      await createMission.mutateAsync({
        type: selectedType,
        name: data.name,
        targetValue: data.targetValue,
        unit: data.unit,
      })
      router.push('/home')
    } catch (err) {
      console.error('Error creating mission:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('ミッションの作成に失敗しました')
      }
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <button
            onClick={() => router.back()}
            className="mr-4 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ← 戻る
          </button>
          <h1 className="text-lg font-bold">ミッション作成</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Mission Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">タイプ</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button
                type="button"
                variant={selectedType === 'workout' ? 'primary' : 'outline'}
                onClick={() => setSelectedType('workout')}
                className={cn(
                  'flex-1',
                  selectedType === 'workout' && 'bg-orange-600 hover:bg-orange-700'
                )}
              >
                筋トレ
              </Button>
              <Button
                type="button"
                variant={selectedType === 'study' ? 'primary' : 'outline'}
                onClick={() => setSelectedType('study')}
                className={cn(
                  'flex-1',
                  selectedType === 'study' && 'bg-blue-600 hover:bg-blue-700'
                )}
              >
                勉強
              </Button>
            </CardContent>
          </Card>

          {/* Mission Name */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ミッション名</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                {...register('name')}
                placeholder="例: 腕立て伏せ、英単語暗記"
                maxLength={50}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Target Value */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">目標値</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                {...register('targetValue', { valueAsNumber: true })}
                type="number"
                inputMode="numeric"
                placeholder="例: 30"
                min={1}
                max={9999}
              />
              {errors.targetValue && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.targetValue.message}
                </p>
              )}

              {/* Unit presets */}
              <div>
                <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
                  単位
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_UNITS.map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setValue('unit', unit)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-sm transition-colors',
                        currentUnit === unit
                          ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                          : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600'
                      )}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                {...register('unit')}
                placeholder="カスタム単位"
                maxLength={10}
              />
              {errors.unit && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.unit.message}
                </p>
              )}
            </CardContent>
          </Card>

          {error && (
            <p className="text-center text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={createMission.isPending}
          >
            {createMission.isPending ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                作成中...
              </>
            ) : (
              'ミッションを作成'
            )}
          </Button>
        </form>
      </main>
    </div>
  )
}
