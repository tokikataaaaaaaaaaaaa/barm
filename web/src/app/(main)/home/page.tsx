'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/hooks/use-auth'
import { useMissions } from '@/lib/hooks/use-missions'
import { useTodayRecords, useUpsertRecord } from '@/lib/hooks/use-records'
import { useChallenges, useMyParticipations } from '@/lib/hooks/use-challenges'
import { getTodayDateString } from '@/lib/firebase/records'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { MissionCard } from '@/components/features/mission/mission-card'
import { ChallengeCard, CHALLENGE_CONFIG, formatDateRange } from '@/components/features/challenge'
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

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: missions, isLoading: isMissionsLoading } = useMissions()
  const { data: todayRecords } = useTodayRecords()
  const { data: challenges, isLoading: isChallengesLoading } = useChallenges()
  const { data: myParticipations } = useMyParticipations()
  const upsertRecord = useUpsertRecord()
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

  // Challenge helpers
  const participatingChallengeIds = new Set(myParticipations?.map((p) => p.challengeId) || [])
  const upcomingChallenges = challenges?.filter((c) => c.status === 'upcoming') || []
  const activeChallenges = challenges?.filter((c) => c.status === 'active') || []
  const myActiveParticipation = myParticipations?.find((p) =>
    activeChallenges.some((c) => c.id === p.challengeId)
  )
  const myActiveChallenge = activeChallenges.find((c) => participatingChallengeIds.has(c.id))

  const handleChallengeAction = (challengeId: string, isJoined: boolean) => {
    if (isJoined) {
      const challenge = challenges?.find((c) => c.id === challengeId)
      if (challenge?.status === 'upcoming') {
        router.push(`/challenges/${challengeId}/waiting`)
      } else {
        router.push(`/challenges/${challengeId}`)
      }
    } else {
      router.push(`/challenges/${challengeId}/join`)
    }
  }

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
        {/* Challenge Section - Primary */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl tracking-wide">CHALLENGE</h2>
            <Link href="/challenges">
              <Button variant="ghost" size="sm">すべて見る →</Button>
            </Link>
          </div>

          {isChallengesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : myActiveChallenge ? (
            // Show active challenge if participating
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card
                className="p-5 cursor-pointer hover:border-accent/50 transition-colors"
                onClick={() => router.push(`/challenges/${myActiveChallenge.id}`)}
              >
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-4xl">{CHALLENGE_CONFIG[myActiveChallenge.type].icon}</span>
                  <div className="flex-1">
                    <p className="text-body font-medium">{CHALLENGE_CONFIG[myActiveChallenge.type].label}</p>
                    <p className="text-body-sm text-muted-foreground">
                      {formatDateRange(myActiveChallenge.startDate, myActiveChallenge.endDate)}
                    </p>
                  </div>
                  <Badge variant="success">参加中</Badge>
                </div>
                {myActiveParticipation && (
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{myActiveParticipation.goal.icon}</span>
                      <span className="text-body-sm">{myActiveParticipation.goal.name}</span>
                      <span className="text-body-sm text-muted-foreground ml-auto">
                        {myActiveParticipation.achievedDays}日達成
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          ) : upcomingChallenges.length > 0 ? (
            // Show upcoming challenges
            <div className="space-y-3">
              {upcomingChallenges.slice(0, 2).map((challenge) => {
                const isJoined = participatingChallengeIds.has(challenge.id)
                return (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    isJoined={isJoined}
                    onJoin={() => handleChallengeAction(challenge.id, isJoined)}
                  />
                )
              })}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-4xl mb-3">🏆</p>
              <p className="text-body text-muted-foreground">
                現在募集中のチャレンジはありません
              </p>
              <p className="text-body-sm text-muted-foreground mt-1">
                次のチャレンジをお楽しみに!
              </p>
            </Card>
          )}
        </motion.section>

        {/* Live Feed Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl tracking-wide">LIVE FEED</h2>
            <Badge variant="secondary" size="sm">
              {feedItems.length} 件
            </Badge>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {feedItems.slice(0, 5).map((item, index) => (
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
            className="mt-6 text-center py-4"
          >
            <p className="text-muted-foreground text-body-sm">
              みんな頑張ってる。
            </p>
            <p className="font-display text-lg tracking-wide text-accent mt-1">
              俺も負けてられない。
            </p>
          </motion.div>
        </motion.section>
      </main>
    </div>
  )
}
