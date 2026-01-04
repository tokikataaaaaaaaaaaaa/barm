'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/hooks/use-auth'
import {
  useChallengeWithParticipation,
  useUpdateNotification,
  useWithdrawFromChallenge,
} from '@/lib/hooks/use-challenges'
import { getDaysUntilStart } from '@/lib/firebase/challenges'
import { CHALLENGE_CONFIG, formatDateRange, NOTIFICATION_TIME_OPTIONS } from '@/components/features/challenge'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { MIN_TEAM_SIZE, MAX_TEAM_SIZE } from '@/lib/types'

interface WaitingPageProps {
  params: Promise<{ id: string }>
}

export default function WaitingPage({ params }: WaitingPageProps) {
  const { id: challengeId } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const { challenge, participation, isLoading, error } = useChallengeWithParticipation(challengeId)
  const updateNotification = useUpdateNotification()
  const withdrawFromChallenge = useWithdrawFromChallenge()

  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
  const [notificationTime, setNotificationTime] = useState(participation?.notificationTime || '20:00')
  const [notificationEnabled, setNotificationEnabled] = useState(participation?.notificationEnabled ?? true)

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
    router.push(`/challenges/${challengeId}/join`)
    return null
  }

  // If challenge has started, redirect to detail page
  if (challenge.status !== 'upcoming') {
    router.push(`/challenges/${challengeId}`)
    return null
  }

  const config = CHALLENGE_CONFIG[challenge.type]
  const daysUntilStart = getDaysUntilStart(challenge)

  const handleNotificationToggle = async () => {
    const newEnabled = !notificationEnabled
    setNotificationEnabled(newEnabled)
    await updateNotification.mutateAsync({
      participationId: participation.id,
      input: { notificationTime, notificationEnabled: newEnabled },
    })
  }

  const handleTimeChange = async (time: string) => {
    setNotificationTime(time)
    await updateNotification.mutateAsync({
      participationId: participation.id,
      input: { notificationTime: time, notificationEnabled },
    })
  }

  const handleWithdraw = async () => {
    await withdrawFromChallenge.mutateAsync({
      participationId: participation.id,
      challengeId: challenge.id,
    })
    router.push('/challenges')
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/challenges/${challengeId}/info`)}
            >
              ℹ️
            </Button>
          </div>
        </div>
      </header>

      <main className="container-mobile pb-24 py-6 space-y-6">
        {/* Countdown Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 text-center">
            <span className="text-5xl mb-4 block">{config.icon}</span>
            <h3 className="font-display text-lg tracking-wide mb-2">{config.label}</h3>
            <p className="text-body-sm text-muted-foreground mb-4">
              {formatDateRange(challenge.startDate, challenge.endDate)}
            </p>

            <div className="bg-accent/10 rounded-2xl p-6 mb-4">
              <p className="text-body-sm text-muted-foreground mb-1">開始まで</p>
              <motion.p
                className="font-display text-5xl text-accent"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                key={daysUntilStart}
              >
                {daysUntilStart}
              </motion.p>
              <p className="text-body-sm text-muted-foreground">日</p>
            </div>

            <Badge variant="secondary" size="sm">
              現在 {challenge.participantCount}人 が参加登録済み
            </Badge>
          </Card>
        </motion.div>

        {/* Your Goal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-body-sm text-muted-foreground">あなたの目標</p>
              <button
                onClick={() => router.push(`/challenges/${challengeId}/edit-goal`)}
                className="text-body-sm text-accent hover:underline"
              >
                編集
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{participation.goal.icon}</span>
              <div>
                <p className="text-body font-medium">{participation.goal.name}</p>
                <p className="text-body-sm text-muted-foreground">
                  {participation.goal.targetValue}
                  {participation.goal.unit}/日
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Team Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">👥</span>
              <h3 className="text-body font-medium">チーム分けについて</h3>
            </div>
            <p className="text-body-sm text-muted-foreground">
              チャレンジ開始時に、参加者は{MIN_TEAM_SIZE}〜{MAX_TEAM_SIZE}
              人のチームに自動で振り分けられます。 チームメンバーと一緒にゴールを目指しましょう！
            </p>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔔</span>
                <h3 className="text-body font-medium">通知設定</h3>
              </div>
              <button
                onClick={handleNotificationToggle}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notificationEnabled ? 'bg-accent' : 'bg-secondary'
                }`}
              >
                <motion.div
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                  animate={{ left: notificationEnabled ? '26px' : '4px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {notificationEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <p className="text-body-sm text-muted-foreground mb-3">毎日のリマインダー時刻</p>
                <div className="flex flex-wrap gap-2">
                  {['09:00', '12:00', '18:00', '20:00', '21:00'].map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeChange(time)}
                      className={`px-3 py-1.5 rounded-lg text-body-sm font-medium transition-all ${
                        notificationTime === time
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <p className="text-caption text-muted-foreground mt-3">
                  ※ 実際の通知はチャレンジが開始されてから送られます
                </p>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Withdraw Button */}
        <div className="pt-4 border-t border-border">
          {!showWithdrawConfirm ? (
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => setShowWithdrawConfirm(true)}
            >
              チャレンジを辞退する
            </Button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <Card className="p-4 bg-danger/10 border-danger/30">
                <p className="text-body-sm text-center">
                  本当に辞退しますか？
                  <br />
                  この操作は取り消せません。
                </p>
              </Card>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowWithdrawConfirm(false)}>
                  キャンセル
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={handleWithdraw}
                  disabled={withdrawFromChallenge.isPending}
                >
                  辞退する
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
