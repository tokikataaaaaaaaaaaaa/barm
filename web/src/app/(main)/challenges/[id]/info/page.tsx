'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useChallenge, useChallengeWithParticipation } from '@/lib/hooks/use-challenges'
import {
  CHALLENGE_CONFIG,
  formatDateRange,
} from '@/components/features/challenge'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MIN_TEAM_SIZE, MAX_TEAM_SIZE, COMPLETION_THRESHOLD, CHALLENGE_DURATION } from '@/lib/types'

interface InfoPageProps {
  params: Promise<{ id: string }>
}

const INFO_SECTIONS = [
  {
    icon: '🎯',
    title: '目標を立てる',
    description: '毎日達成したい目標を設定します。筋トレ、運動、勉強など、自分に合った目標を選びましょう。',
  },
  {
    icon: '👥',
    title: 'チームで挑戦',
    description: `チャレンジ開始時に${MIN_TEAM_SIZE}〜${MAX_TEAM_SIZE}人のチームに自動で振り分けられます。仲間と一緒に頑張ることでモチベーションが続きます。`,
  },
  {
    icon: '📅',
    title: '毎日記録',
    description: '毎日の達成状況を記録します。カレンダーで自分と仲間の進捗を確認できます。',
  },
  {
    icon: '🏆',
    title: '達成を目指す',
    description: `全日程の${Math.round(COMPLETION_THRESHOLD * 100)}%以上達成すると「COMPLETED」バッジがもらえます。`,
  },
]

export default function InfoPage({ params }: InfoPageProps) {
  const { id: challengeId } = use(params)
  const router = useRouter()
  const { challenge, participation, isLoading, error } = useChallengeWithParticipation(challengeId)

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

  const config = CHALLENGE_CONFIG[challenge.type]
  const totalDays = CHALLENGE_DURATION[challenge.type]

  const handleAction = () => {
    if (participation) {
      if (challenge.status === 'upcoming') {
        router.push(`/challenges/${challengeId}/waiting`)
      } else if (challenge.status === 'active') {
        router.push(`/challenges/${challengeId}`)
      } else {
        router.push(`/challenges/${challengeId}/result`)
      }
    } else if (challenge.status === 'upcoming') {
      router.push(`/challenges/${challengeId}/join`)
    } else {
      router.push('/challenges')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container-mobile">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="text-muted-foreground hover:text-foreground"
              >
                ←
              </button>
              <h1 className="font-display text-lg tracking-wide">チャレンジについて</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container-mobile pb-24 py-6 space-y-6">
        {/* Challenge Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 text-center">
            <span className="text-5xl block mb-4">{config.icon}</span>
            <h2 className="font-display text-2xl tracking-wide mb-2">{config.label}</h2>
            <p className="text-body-sm text-muted-foreground mb-2">
              {formatDateRange(challenge.startDate, challenge.endDate)}
            </p>
            <p className="text-body text-accent font-medium">{totalDays}日間</p>
          </Card>
        </motion.div>

        {/* How it works */}
        <div>
          <h3 className="text-body font-medium mb-4">チャレンジの流れ</h3>
          <div className="space-y-4">
            {INFO_SECTIONS.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-xl">
                        {section.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-body font-medium mb-1">{section.title}</h4>
                      <p className="text-body-sm text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-body font-medium mb-4">ルール</h3>
          <Card className="p-5 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-lg">1.</span>
              <p className="text-body-sm text-muted-foreground">
                毎日、設定した目標を達成したら記録をつけます
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">2.</span>
              <p className="text-body-sm text-muted-foreground">
                記録はその日中につけてください（翌日以降は変更不可）
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">3.</span>
              <p className="text-body-sm text-muted-foreground">
                チームメンバーの進捗はカレンダーで確認できます
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">4.</span>
              <p className="text-body-sm text-muted-foreground">
                開始後の辞退・目標変更はできません
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Participation Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-4 bg-accent/10 border-accent/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💡</span>
              <span className="text-body font-medium">初回は無料で参加できます</span>
            </div>
            <p className="text-body-sm text-muted-foreground">
              2回目以降は参加費（¥{config.price}〜）がかかります。
              チャレンジ達成者には報酬が分配されます。
            </p>
          </Card>
        </motion.div>

        {/* Action Button */}
        <div className="pt-4">
          <Button variant="accent" className="w-full" onClick={handleAction}>
            {participation
              ? challenge.status === 'upcoming'
                ? '待機画面に戻る'
                : challenge.status === 'active'
                  ? 'チャレンジに戻る'
                  : '結果を見る'
              : challenge.status === 'upcoming'
                ? 'チャレンジに参加する'
                : '一覧に戻る'}
          </Button>
        </div>
      </main>
    </div>
  )
}
