'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CalendarView } from './CalendarView'
import {
  Challenge,
  ChallengeParticipation,
  ParticipantWithStatus,
  CHALLENGE_CONFIG,
  getRemainingDays,
  MOCK_RECORDS,
} from '../_data/mock'

// 通知時刻オプション
const NOTIFICATION_TIMES = ['09:00', '12:00', '18:00', '20:00', '21:00']

interface ChallengeDetailProps {
  challenge: Challenge
  participation: ChallengeParticipation
  participants: ParticipantWithStatus[]
  onRecordUpdate: (value: number) => void
  onComplete: () => void
  onShowOnboarding?: () => void
  onNotificationChange?: (time: string, enabled: boolean) => void
}

export function ChallengeDetail({
  challenge,
  participation,
  participants,
  onRecordUpdate,
  onComplete,
  onShowOnboarding,
  onNotificationChange,
}: ChallengeDetailProps) {
  const config = CHALLENGE_CONFIG[challenge.type]
  const remainingDays = getRemainingDays(challenge.endDate)
  const [recordValue, setRecordValue] = useState(participation.goal.targetValue)
  const [memo, setMemo] = useState('')
  const [isAchieved, setIsAchieved] = useState(false)
  const [notificationTime, setNotificationTime] = useState(participation.notificationTime || '20:00')
  const [notificationEnabled, setNotificationEnabled] = useState(participation.notificationEnabled ?? true)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)

  const achievedDays = MOCK_RECORDS.filter((r) => r.achieved).length
  const totalDays = config.days

  const handleRecord = () => {
    onRecordUpdate(recordValue)
    if (recordValue >= participation.goal.targetValue) {
      setIsAchieved(true)
    }
  }

  const handleNotificationToggle = () => {
    const newEnabled = !notificationEnabled
    setNotificationEnabled(newEnabled)
    onNotificationChange?.(notificationTime, newEnabled)
  }

  const handleTimeChange = (time: string) => {
    setNotificationTime(time)
    onNotificationChange?.(time, notificationEnabled)
  }

  return (
    <div className="space-y-6">
      {/* Header with info icon */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg tracking-wide">チャレンジ進行中</h2>
        <button
          onClick={onShowOnboarding}
          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
          title="オンボーディングを見る"
        >
          <span className="text-sm font-bold">i</span>
        </button>
      </div>

      {/* Progress Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-body font-medium">{achievedDays}/{totalDays}日達成</span>
            <Progress value={achievedDays} max={totalDays} className="w-24" />
          </div>
          <span className="text-body-sm text-muted-foreground">残り {remainingDays}日</span>
        </div>
      </Card>

      {/* Record Input Card */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{participation.goal.icon}</span>
          <div>
            <h3 className="text-body font-medium">{participation.goal.name}</h3>
            <p className="text-caption text-muted-foreground">
              {participation.goal.targetValue}{participation.goal.unit}/日
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-body-sm text-muted-foreground mb-2">今日の記録</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setRecordValue(Math.max(0, recordValue - 5))}
              className="w-12 h-12 rounded-xl bg-secondary text-xl font-bold hover:bg-secondary/80 active:scale-95 transition-all"
            >
              -
            </button>
            <motion.div
              animate={{
                color: recordValue >= participation.goal.targetValue
                  ? 'hsl(45 93% 47%)'
                  : 'inherit',
                scale: recordValue >= participation.goal.targetValue ? [1, 1.1, 1] : 1,
              }}
              className="font-display text-4xl w-24 text-center"
            >
              {recordValue}
            </motion.div>
            <button
              onClick={() => setRecordValue(recordValue + 5)}
              className="w-12 h-12 rounded-xl bg-secondary text-xl font-bold hover:bg-secondary/80 active:scale-95 transition-all"
            >
              +
            </button>
          </div>
          <p className="text-center text-caption text-muted-foreground mt-2">
            {participation.goal.unit}
          </p>
        </div>

        {/* Memo input */}
        <div className="mb-4">
          <p className="text-body-sm text-muted-foreground mb-2">メモ (任意)</p>
          <input
            type="text"
            placeholder="今日の一言を残そう..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full h-11 rounded-xl bg-secondary border border-border px-4 text-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <Button
          variant="accent"
          className={`w-full ${isAchieved ? 'bg-success hover:bg-success/90' : ''}`}
          onClick={handleRecord}
          disabled={isAchieved}
        >
          {isAchieved ? '✓ 達成！' : '記録する'}
        </Button>
      </Card>

      {/* Calendar View - Shows all participants' records by day */}
      <CalendarView
        participants={participants}
        challengeDays={MOCK_RECORDS.map((r) => r.date)}
      />

      {/* Notification Settings */}
      <Card className="p-5">
        <button
          onClick={() => setShowNotificationSettings(!showNotificationSettings)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🔔</span>
            <span className="text-body font-medium">通知設定</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-body-sm text-muted-foreground">
              {notificationEnabled ? notificationTime : 'オフ'}
            </span>
            <span className="text-muted-foreground">
              {showNotificationSettings ? '▲' : '▼'}
            </span>
          </div>
        </button>

        {showNotificationSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-body-sm">通知を受け取る</span>
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
              <div>
                <p className="text-body-sm text-muted-foreground mb-2">
                  リマインダー時刻
                </p>
                <div className="flex flex-wrap gap-2">
                  {NOTIFICATION_TIMES.map((time) => (
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
              </div>
            )}

            <p className="text-caption text-muted-foreground mt-3">
              ※ チャレンジ開始後は取り消しできませんが、通知はオフにできます
            </p>
          </motion.div>
        )}
      </Card>

      {/* Demo: Complete button */}
      <div className="pt-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full"
          onClick={onComplete}
        >
          [Demo] チャレンジを完了する
        </Button>
      </div>
    </div>
  )
}
