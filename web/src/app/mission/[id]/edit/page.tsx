'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { useMission, useUpdateMission } from '@/lib/hooks/use-missions'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const missionSchema = z.object({
  name: z
    .string()
    .min(1, 'Mission name is required')
    .max(50, 'Max 50 characters'),
  targetValue: z
    .number({ invalid_type_error: 'Please enter a number' })
    .min(1, 'Must be at least 1')
    .max(9999, 'Must be 9999 or less'),
  unit: z
    .string()
    .min(1, 'Unit is required')
    .max(10, 'Max 10 characters'),
})

type MissionForm = z.infer<typeof missionSchema>

const PRESET_UNITS = ['reps', 'min', 'pages', 'km', 'sets']

export default function EditMissionPage() {
  const router = useRouter()
  const params = useParams()
  const missionId = params.id as string

  const { data: mission, isLoading } = useMission(missionId)
  const updateMission = useUpdateMission()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<MissionForm>({
    resolver: zodResolver(missionSchema),
    defaultValues: {
      name: '',
      targetValue: 0,
      unit: '',
    },
  })

  // Populate form when mission data is loaded
  useEffect(() => {
    if (mission) {
      reset({
        name: mission.name,
        targetValue: mission.targetValue,
        unit: mission.unit,
      })
    }
  }, [mission, reset])

  const currentUnit = watch('unit')

  const onSubmit = async (data: MissionForm) => {
    try {
      await updateMission.mutateAsync({
        missionId,
        input: {
          name: data.name,
          targetValue: data.targetValue,
          unit: data.unit,
        },
      })
      router.push(`/mission/${missionId}`)
    } catch (error) {
      console.error('Failed to update mission:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!mission) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-zinc-500 dark:text-zinc-400">
          Mission not found
        </p>
        <Link href="/home">
          <Button>Back to Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <button
            onClick={() => router.back()}
            className="mr-4 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            {'<-'} Back
          </button>
          <h1 className="text-lg font-bold">Edit Mission</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Mission Type (read-only) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div
                  className={cn(
                    'flex-1 rounded-lg border py-2 text-center',
                    mission.type === 'workout'
                      ? 'border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-950/30'
                      : 'border-zinc-200 text-zinc-400 dark:border-zinc-700'
                  )}
                >
                  Workout
                </div>
                <div
                  className={cn(
                    'flex-1 rounded-lg border py-2 text-center',
                    mission.type === 'study'
                      ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/30'
                      : 'border-zinc-200 text-zinc-400 dark:border-zinc-700'
                  )}
                >
                  Study
                </div>
              </div>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Type cannot be changed after creation.
              </p>
            </CardContent>
          </Card>

          {/* Mission Name */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mission Name</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                {...register('name')}
                placeholder="e.g., Push-ups, English Reading"
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
              <CardTitle className="text-base">Target Value</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                {...register('targetValue', { valueAsNumber: true })}
                type="number"
                inputMode="numeric"
                placeholder="e.g., 30"
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
                  Unit
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_UNITS.map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setValue('unit', unit, { shouldDirty: true })}
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
                placeholder="Custom unit"
                maxLength={10}
              />
              {errors.unit && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.unit.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={updateMission.isPending || !isDirty}
              isLoading={updateMission.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
