'use client'

import { use, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import {
  useChallengeWithParticipation,
  useRecords,
  useTeamParticipations,
} from '@/lib/hooks/use-challenges'
import { getChallengeDays } from '@/lib/firebase/challenges'
import { CHALLENGE_CONFIG } from '@/components/features/challenge'
import { ChallengeResult } from '@/components/features/challenge/ChallengeResult'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { EmptyState } from '@/components/shared/empty-state'
import { ChallengeResultData, CHALLENGE_DURATION } from '@/lib/types'

interface ResultPageProps {
  params: Promise<{ id: string }>
}

export default function ResultPage({ params }: ResultPageProps) {
  const { id: challengeId } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const { challenge, participation, isLoading, error } = useChallengeWithParticipation(challengeId)
  const { data: records = [] } = useRecords(participation?.id || '')
  const { data: teamParticipations = [] } = useTeamParticipations(participation?.teamId || '')

  const resultData = useMemo<ChallengeResultData | null>(() => {
    if (!challenge || !participation) return null

    const totalDays = CHALLENGE_DURATION[challenge.type]
    const achievedDays = participation.achievedDays

    // Build rankings from team participations
    const rankings = teamParticipations
      .map((p) => ({
        userId: p.userId,
        displayName: null, // TODO: Fetch user display names
        achievedDays: p.achievedDays,
        totalDays,
      }))
      .sort((a, b) => b.achievedDays - a.achievedDays)

    const rank = rankings.findIndex((r) => r.userId === user?.id) + 1

    return {
      achievedDays,
      totalDays,
      rank,
      rankings,
    }
  }, [challenge, participation, teamParticipations, user?.id])

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
          action={{ label: '一覧に戻る', onClick: () => router.push('/challenges') }}
        />
      </div>
    )
  }

  if (!participation) {
    return (
      <div className="min-h-screen bg-background p-6">
        <EmptyState
          icon="🤔"
          title="このチャレンジには参加していません"
          action={{ label: '一覧に戻る', onClick: () => router.push('/challenges') }}
        />
      </div>
    )
  }

  // Only show result page for completed challenges
  if (challenge.status !== 'completed') {
    router.push(`/challenges/${challengeId}`)
    return null
  }

  if (!resultData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const config = CHALLENGE_CONFIG[challenge.type]
  const goalDescription = `${participation.goal.name} ${participation.goal.targetValue}${participation.goal.unit}/日`

  const handleNextChallenge = () => {
    router.push('/challenges')
  }

  const handleGoHome = () => {
    router.push('/')
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
              <h1 className="font-display text-lg tracking-wide">{config.label} 結果</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container-mobile">
        <ChallengeResult
          result={resultData}
          goalDescription={goalDescription}
          currentUserId={user?.id || ''}
          onNextChallenge={handleNextChallenge}
          onGoHome={handleGoHome}
        />
      </main>
    </div>
  )
}
