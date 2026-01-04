'use client'

import { use, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/hooks/use-auth'
import {
  useChallengeWithParticipation,
  useChallengeProgress,
  useRecords,
  useUpsertRecord,
  useTeamParticipations,
} from '@/lib/hooks/use-challenges'
import { getChallengeDays, getRemainingDays } from '@/lib/firebase/challenges'
import {
  ChallengeProgress,
  CalendarView,
  RecordInput,
  CHALLENGE_CONFIG,
  formatDateRange,
} from '@/components/features/challenge'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { ParticipantWithRecords, ChallengeRecord } from '@/lib/types'

interface ChallengeDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ChallengeDetailPage({ params }: ChallengeDetailPageProps) {
  const { id: challengeId } = use(params)
  const router = useRouter()
  const { firebaseUser, user } = useAuth()
  const { challenge, participation, isLoading, error } = useChallengeWithParticipation(challengeId)
  const { data: myRecords } = useRecords(participation?.id || '')
  const { data: teamParticipations } = useTeamParticipations(participation?.teamId || null)
  const upsertRecord = useUpsertRecord()

  const progress = useChallengeProgress(challenge)
  const today = new Date().toISOString().split('T')[0]

  // Build participants with records for CalendarView
  const participantsWithRecords: ParticipantWithRecords[] = useMemo(() => {
    if (!participation || !teamParticipations) return []

    return teamParticipations.map((p) => ({
      participation: p,
      user: {
        id: p.userId,
        displayName: p.userId === firebaseUser?.uid ? user?.displayName || null : null, // We'd fetch this from users collection in production
      },
      records: p.id === participation.id ? (myRecords || []) : [], // We'd fetch team records in production
      isCurrentUser: p.userId === firebaseUser?.uid,
    }))
  }, [participation, teamParticipations, myRecords, firebaseUser?.uid, user?.displayName])

  const todayRecord = useMemo(() => {
    return myRecords?.find((r) => r.date === today)
  }, [myRecords, today])

  const handleRecord = async (value: number, achieved: boolean, memo?: string) => {
    if (!participation) return
    await upsertRecord.mutateAsync({
      participationId: participation.id,
      input: {
        date: today,
        value,
        achieved,
        memo,
      },
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-background p-6">
        <EmptyState
          icon="❌"
          title="チャレンジが見つかりません"
          description="このチャレンジは存在しないか、削除されました"
          action={{
            label: '一覧に戻る',
            onClick: () => router.push('/challenges'),
          }}
        />
      </div>
    )
  }

  if (!participation) {
    return (
      <div className="min-h-screen bg-background p-6">
        <EmptyState
          icon="🔒"
          title="参加していません"
          description="このチャレンジに参加してください"
          action={{
            label: '参加する',
            onClick: () => router.push(`/challenges/${challengeId}/join`),
          }}
        />
      </div>
    )
  }

  const config = CHALLENGE_CONFIG[challenge.type]
  const remainingDays = getRemainingDays(challenge)
  const challengeDays = getChallengeDays(challenge)

  // Check if challenge hasn't started yet
  if (challenge.status === 'upcoming') {
    router.push(`/challenges/${challengeId}/waiting`)
    return null
  }

  // Check if challenge is completed
  if (challenge.status === 'completed') {
    router.push(`/challenges/${challengeId}/result`)
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container-mobile">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/challenges" className="text-muted-foreground hover:text-foreground">
                ←
              </Link>
              <h1 className="font-display text-lg tracking-wide">{config.label}</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/challenges/${challengeId}/info`)}>
              ℹ️
            </Button>
          </div>
        </div>
      </header>

      <main className="container-mobile pb-24 py-6 space-y-6">
        {/* Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ChallengeProgress
            achievedDays={participation.achievedDays}
            totalDays={progress.totalDays}
            remainingDays={remainingDays}
          />
        </motion.div>

        {/* Record Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <RecordInput
            goal={participation.goal}
            currentValue={todayRecord?.value || 0}
            currentMemo={todayRecord?.memo || ''}
            onRecord={handleRecord}
            isLoading={upsertRecord.isPending}
          />
        </motion.div>

        {/* Calendar View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CalendarView
            participants={participantsWithRecords.length > 0 ? participantsWithRecords : [{
              participation,
              user: { id: firebaseUser?.uid || '', displayName: user?.displayName || null },
              records: myRecords || [],
              isCurrentUser: true,
            }]}
            challengeDays={challengeDays}
          />
        </motion.div>
      </main>
    </div>
  )
}
