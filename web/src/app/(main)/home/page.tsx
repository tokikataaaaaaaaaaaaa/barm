'use client'

import Link from 'next/link'
import { useCallback, useMemo } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useMissions } from '@/lib/hooks/use-missions'
import { useTodayRecords, useUpsertRecord } from '@/lib/hooks/use-records'
import { getTodayDateString } from '@/lib/firebase/records'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { MissionCard } from '@/components/features/mission/mission-card'
import { LoadingSpinner } from '@/components/shared/loading-spinner'

export default function HomePage() {
  const { user } = useAuth()
  const { data: missions, isLoading: isMissionsLoading } = useMissions()
  const { data: todayRecords } = useTodayRecords()
  const upsertRecord = useUpsertRecord()

  const recordsByMission = useMemo(() => {
    if (!todayRecords) return new Map()
    return new Map(todayRecords.map((r) => [r.missionId, r]))
  }, [todayRecords])

  const handleRecordUpdate = useCallback(
    async (missionId: string, value: number) => {
      const today = getTodayDateString()
      await upsertRecord.mutateAsync({
        missionId,
        value,
        date: today,
      })
    },
    [upsertRecord]
  )

  const completedCount = useMemo(() => {
    if (!missions || !todayRecords) return 0
    return missions.filter((m) => {
      const record = recordsByMission.get(m.id)
      return record && record.value >= m.targetValue
    }).length
  }, [missions, todayRecords, recordsByMission])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-center px-4">
          <h1 className="text-lg font-bold">BARM</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg p-4 pb-24">
        <div className="mb-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            ようこそ、{user?.displayName ?? 'ゲスト'} さん
          </p>
          <p className="text-2xl font-bold">
            {new Date().toLocaleDateString('ja-JP', {
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            })}
          </p>
          {missions && missions.length > 0 && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {completedCount} / {missions.length} 達成
            </p>
          )}
        </div>

        {isMissionsLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : missions && missions.length > 0 ? (
          <div className="space-y-3">
            {missions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                record={recordsByMission.get(mission.id)}
                onRecordUpdate={(value) => handleRecordUpdate(mission.id, value)}
              />
            ))}

            <Link href="/mission/create">
              <Button variant="outline" className="mt-4 w-full">
                + ミッションを追加
              </Button>
            </Link>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ミッション</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                まだミッションがありません
              </p>
              <Link href="/mission/create">
                <Button variant="outline" className="mt-4 w-full">
                  ミッションを追加
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
