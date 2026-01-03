'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/hooks/use-auth'
import { useMissions } from '@/lib/hooks/use-missions'
import { useTodayRecords, useUpsertRecord } from '@/lib/hooks/use-records'
import { getTodayDateString } from '@/lib/firebase/records'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MissionCard } from '@/components/features/mission/mission-card'
import { FeedCard, LiveIndicator } from '@/components/patterns/feed-card'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { EmptyState } from '@/components/shared/empty-state'

// Mock feed data - will be replaced with real-time Firestore data
const MOCK_FEED = [
  { id: '1', user: { name: 'Taro' }, mission: { name: '腕立て伏せ', value: 50, unit: '回', icon: '💪' }, timeAgo: '2分前' },
  { id: '2', user: { name: 'Yuki' }, mission: { name: '読書', value: 30, unit: '分', icon: '📚' }, timeAgo: '5分前' },
  { id: '3', user: { name: 'Ken' }, mission: { name: 'ランニング', value: 5, unit: 'km', icon: '🏃' }, timeAgo: '8分前' },
  { id: '4', user: { name: 'Masa' }, mission: { name: '瞑想', value: 15, unit: '分', icon: '🧘' }, timeAgo: '12分前' },
  { id: '5', user: { name: 'Shin' }, mission: { name: 'スクワット', value: 100, unit: '回', icon: '🦵' }, timeAgo: '15分前' },
  { id: '6', user: { name: 'Ryu' }, mission: { name: '英語学習', value: 20, unit: '分', icon: '🌍' }, timeAgo: '20分前' },
  { id: '7', user: { name: 'Koji' }, mission: { name: 'プランク', value: 3, unit: '分', icon: '🏋️' }, timeAgo: '25分前' },
  { id: '8', user: { name: 'Hiro' }, mission: { name: 'ストレッチ', value: 10, unit: '分', icon: '🤸' }, timeAgo: '30分前' },
]

type ViewMode = 'feed' | 'missions'

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: missions, isLoading: isMissionsLoading } = useMissions()
  const { data: todayRecords } = useTodayRecords()
  const upsertRecord = useUpsertRecord()
  const [viewMode, setViewMode] = useState<ViewMode>('feed')
  const [feedItems, setFeedItems] = useState(MOCK_FEED.slice(0, 4))

  // Simulate new items appearing
  useEffect(() => {
    const interval = setInterval(() => {
      setFeedItems(prev => {
        const nextIndex = prev.length
        if (nextIndex < MOCK_FEED.length) {
          return [...prev, MOCK_FEED[nextIndex]]
        }
        return prev
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

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

  const { completedCount, totalCount, progressPercent } = useMemo(() => {
    if (!missions || !todayRecords) return { completedCount: 0, totalCount: 0, progressPercent: 0 }
    const completed = missions.filter((m) => {
      const record = recordsByMission.get(m.id)
      return record && record.value >= m.targetValue
    }).length
    return {
      completedCount: completed,
      totalCount: missions.length,
      progressPercent: missions.length > 0 ? Math.round((completed / missions.length) * 100) : 0,
    }
  }, [missions, todayRecords, recordsByMission])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container-mobile">
          <div className="flex h-14 items-center justify-between">
            <h1 className="font-display text-2xl tracking-wide">BARM</h1>
            <div className="flex items-center gap-3">
              <LiveIndicator />
              <Avatar fallback={user?.displayName || 'G'} size="sm" />
            </div>
          </div>
        </div>
      </header>

      <main className="container-mobile pb-24">
        {/* User Status Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6"
        >
          <div className="rounded-2xl bg-gradient-to-br from-card via-card to-secondary-800/30 border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-body-sm text-muted-foreground">
                  {new Date().toLocaleDateString('ja-JP', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </p>
                <p className="font-display text-xl tracking-wide mt-1">
                  {user?.displayName || 'GUEST'}
                </p>
              </div>
              {missions && missions.length > 0 && (
                <div className="text-right">
                  <p className="font-display text-3xl text-accent">{completedCount}/{totalCount}</p>
                  <p className="text-caption text-muted-foreground">達成</p>
                </div>
              )}
            </div>
            {missions && missions.length > 0 && (
              <div>
                <div className="flex justify-between text-caption text-muted-foreground mb-2">
                  <span>今日の進捗</span>
                  <span>{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} max={100} />
              </div>
            )}
          </div>
        </motion.section>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('feed')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
              viewMode === 'feed'
                ? 'bg-accent text-accent-foreground shadow-glow'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            🔥 みんなの記録
          </button>
          <button
            onClick={() => setViewMode('missions')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
              viewMode === 'missions'
                ? 'bg-accent text-accent-foreground shadow-glow'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            📋 自分のミッション
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {viewMode === 'feed' ? (
            <motion.section
              key="feed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl tracking-wide">LIVE FEED</h2>
                <Badge variant="secondary" size="sm">
                  {feedItems.length} 件
                </Badge>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {feedItems.map((item, index) => (
                    <FeedCard
                      key={item.id}
                      user={item.user}
                      mission={item.mission}
                      timeAgo={item.timeAgo}
                      isNew={index === feedItems.length - 1 && feedItems.length > 4}
                      index={Math.min(index, 4)}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Motivation message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center py-6 border-t border-border"
              >
                <p className="text-muted-foreground text-body-sm">
                  みんな頑張ってる。
                </p>
                <p className="font-display text-lg tracking-wide text-accent mt-1">
                  俺も負けてられない。
                </p>
                <Button
                  variant="accent"
                  className="mt-4"
                  onClick={() => setViewMode('missions')}
                >
                  記録をつける →
                </Button>
              </motion.div>
            </motion.section>
          ) : (
            <motion.section
              key="missions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl tracking-wide">MY MISSIONS</h2>
                <Link href="/mission/create">
                  <Button variant="ghost" size="sm">+ 追加</Button>
                </Link>
              </div>

              {isMissionsLoading ? (
                <div className="flex justify-center py-12">
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
                </div>
              ) : (
                <EmptyState
                  icon="📋"
                  title="ミッションがありません"
                  description="最初のミッションを作成して、習慣化を始めましょう"
                  action={{
                    label: 'ミッションを作成',
                    onClick: () => router.push('/mission/create'),
                  }}
                />
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
