'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import {
  Challenge,
  ChallengeParticipation,
  CHALLENGE_CONFIG,
  formatDateRange,
  MOCK_USERS,
  MIN_TEAM_SIZE,
  MAX_TEAM_SIZE,
} from '../_data/mock'

interface WaitingScreenProps {
  challenge: Challenge
  participation: ChallengeParticipation
  onWithdraw: () => void
  onShowOnboarding: () => void
  onNotificationChange: (time: string, enabled: boolean) => void
  onEditGoal: () => void
}

// 通知時刻オプション
const NOTIFICATION_TIMES = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00',
]

function getDaysUntilStart(startDate: Date): number {
  const today = new Date()
  const diff = startDate.getTime() - today.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function WaitingScreen({
  challenge,
  participation,
  onWithdraw,
  onShowOnboarding,
  onNotificationChange,
  onEditGoal,
}: WaitingScreenProps) {
  const config = CHALLENGE_CONFIG[challenge.type]
  const daysUntilStart = getDaysUntilStart(challenge.startDate)
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
  const [notificationTime, setNotificationTime] = useState(participation.notificationTime || '20:00')
  const [notificationEnabled, setNotificationEnabled] = useState(participation.notificationEnabled)

  const handleNotificationToggle = () => {
    const newEnabled = !notificationEnabled
    setNotificationEnabled(newEnabled)
    onNotificationChange(notificationTime, newEnabled)
  }

  const handleTimeChange = (time: string) => {
    setNotificationTime(time)
    onNotificationChange(time, notificationEnabled)
  }

  return (
    <div className="space-y-6">
      {/* Header with info icon */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl tracking-wide">チャレンジ待機中</h2>
        <button
          onClick={onShowOnboarding}
          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
          title="オンボーディングを見る"
        >
          <span className="text-sm font-bold">i</span>
        </button>
      </div>

      {/* Countdown Card */}
      <Card className="p-6 text-center">
        <span className="text-5xl mb-4 block">{config.icon}</span>
        <h3 className="font-display text-lg tracking-wide mb-2">
          {config.label}
        </h3>
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

      {/* Your Goal */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-body-sm text-muted-foreground">あなたの目標</p>
          <button
            onClick={onEditGoal}
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
              {participation.goal.targetValue}{participation.goal.unit}/日
            </p>
          </div>
        </div>
      </Card>

      {/* Team Info */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">👥</span>
          <h3 className="text-body font-medium">チーム分けについて</h3>
        </div>
        <p className="text-body-sm text-muted-foreground">
          チャレンジ開始時に、参加者は{MIN_TEAM_SIZE}〜{MAX_TEAM_SIZE}人のチームに自動で振り分けられます。
          チームメンバーと一緒にゴールを目指しましょう！
        </p>
      </Card>

      {/* Notification Settings */}
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
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-body-sm text-muted-foreground mb-3">
              毎日のリマインダー時刻
            </p>
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
              <select
                value={notificationTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-body-sm bg-secondary border-none"
              >
                {NOTIFICATION_TIMES.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-caption text-muted-foreground mt-3">
              ※ 実際の通知はチャレンジが開始されてから送られます
            </p>
          </motion.div>
        )}
      </Card>

      {/* Participants Preview */}
      <Card className="p-5">
        <h3 className="text-body font-medium mb-3">
          参加登録者 ({challenge.participantCount}人)
        </h3>
        <div className="flex -space-x-2">
          {MOCK_USERS.slice(0, Math.min(6, challenge.participantCount)).map((user) => (
            <Avatar
              key={user.id}
              fallback={user.name.charAt(0)}
              size="sm"
              className="border-2 border-card"
            />
          ))}
          {challenge.participantCount > 6 && (
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground border-2 border-card">
              +{challenge.participantCount - 6}
            </div>
          )}
        </div>
      </Card>

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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <Card className="p-4 bg-danger/10 border-danger/30">
              <p className="text-body-sm text-center">
                本当に辞退しますか？<br />
                この操作は取り消せません。
              </p>
            </Card>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowWithdrawConfirm(false)}
              >
                キャンセル
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={onWithdraw}
              >
                辞退する
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
