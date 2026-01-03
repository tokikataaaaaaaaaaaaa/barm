'use client'

import { useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { RecordCalendar } from '@/components/features/mission/record-calendar'
import { useMission, useDeleteMission } from '@/lib/hooks/use-missions'
import { useMissionRecords } from '@/lib/hooks/use-records'
import { calculateStreak } from '@/lib/utils'
import { cn } from '@/lib/utils'

function getDateRangeForMonths(months: number = 3): { startDate: string; endDate: string } {
  const now = new Date()
  const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const start = new Date(now.getFullYear(), now.getMonth() - months, 1)
  const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`

  return { startDate, endDate }
}

function getTodayString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export default function MissionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const missionId = params.id as string

  const { data: mission, isLoading: isMissionLoading } = useMission(missionId)
  const deleteMission = useDeleteMission()

  const { startDate, endDate } = useMemo(() => getDateRangeForMonths(3), [])
  const { data: records, isLoading: isRecordsLoading } = useMissionRecords(
    missionId,
    startDate,
    endDate
  )

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<{
    date: string
    value?: number
  } | null>(null)

  const streak = useMemo(() => {
    if (!records || !mission) return { currentStreak: 0, bestStreak: 0 }
    return calculateStreak(records, mission.targetValue, getTodayString())
  }, [records, mission])

  const handleDelete = async () => {
    try {
      await deleteMission.mutateAsync(missionId)
      router.push('/home')
    } catch (error) {
      console.error('Failed to delete mission:', error)
    }
  }

  const handleDayClick = (date: string, record?: { value: number }) => {
    setSelectedRecord({
      date,
      value: record?.value,
    })
  }

  if (isMissionLoading) {
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
          <h1 className="flex-1 text-lg font-bold truncate">{mission.name}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg p-4 space-y-4">
        {/* Mission Info */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-block h-3 w-3 rounded-full',
                    mission.type === 'workout' ? 'bg-orange-500' : 'bg-blue-500'
                  )}
                />
                <CardTitle className="text-lg">{mission.name}</CardTitle>
              </div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {mission.type === 'workout' ? 'Workout' : 'Study'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {mission.targetValue} {mission.unit}
              <span className="ml-2 text-base font-normal text-zinc-500 dark:text-zinc-400">
                / day
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-around">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl">{'>'}</span>
                  <span className="text-3xl font-bold">{streak.currentStreak}</span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Current Streak
                </p>
              </div>
              <div className="h-10 w-px bg-zinc-200 dark:bg-zinc-800" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl">{'*'}</span>
                  <span className="text-3xl font-bold">{streak.bestStreak}</span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Best Streak
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Record History</CardTitle>
          </CardHeader>
          <CardContent>
            {isRecordsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <RecordCalendar
                records={records ?? []}
                targetValue={mission.targetValue}
                unit={mission.unit}
                onDayClick={handleDayClick}
              />
            )}
          </CardContent>
        </Card>

        {/* Selected day detail */}
        {selectedRecord && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {selectedRecord.date}
                  </p>
                  <p className="text-lg font-medium">
                    {selectedRecord.value !== undefined
                      ? `${selectedRecord.value} ${mission.unit}`
                      : 'No record'}
                  </p>
                </div>
                {selectedRecord.value !== undefined && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-xs font-medium',
                      selectedRecord.value >= mission.targetValue
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                    )}
                  >
                    {selectedRecord.value >= mission.targetValue
                      ? 'Achieved'
                      : 'Not achieved'}
                  </span>
                )}
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  x
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Link href={`/mission/${missionId}/edit`} className="flex-1">
            <Button variant="outline" className="w-full">
              Edit Mission
            </Button>
          </Link>
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </Button>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="mx-4 max-w-sm">
              <CardHeader>
                <CardTitle className="text-base">Delete Mission?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Are you sure you want to delete &ldquo;{mission.name}&rdquo;? This action cannot be undone.
                  All records for this mission will also be deleted.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={handleDelete}
                    disabled={deleteMission.isPending}
                    isLoading={deleteMission.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
