'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChallengeGoal } from '@/lib/types'

interface RecordInputProps {
  goal: ChallengeGoal
  currentValue?: number
  currentMemo?: string
  onRecord: (value: number, achieved: boolean, memo?: string) => Promise<void>
  isLoading?: boolean
}

export function RecordInput({
  goal,
  currentValue = 0,
  currentMemo = '',
  onRecord,
  isLoading = false,
}: RecordInputProps) {
  const [value, setValue] = useState(currentValue)
  const [memo, setMemo] = useState(currentMemo)
  const [showSuccess, setShowSuccess] = useState(false)

  const isAchieved = value >= goal.targetValue

  const handleIncrement = () => {
    setValue((v) => v + 1)
  }

  const handleDecrement = () => {
    setValue((v) => Math.max(0, v - 1))
  }

  const handleRecord = async () => {
    try {
      await onRecord(value, isAchieved, memo || undefined)
      if (isAchieved) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)
      }
    } catch (error) {
      console.error('Failed to record:', error)
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{goal.icon}</span>
        <div>
          <h3 className="text-body font-medium">今日の記録</h3>
          <p className="text-caption text-muted-foreground">
            {goal.name} {goal.targetValue}
            {goal.unit}/日
          </p>
        </div>
      </div>

      {/* Value Input */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleDecrement}
          disabled={isLoading}
          className="w-12 h-12 text-xl"
        >
          -
        </Button>

        <motion.div
          animate={isAchieved ? { scale: [1, 1.1, 1] } : {}}
          className={`text-4xl font-display w-24 text-center ${
            isAchieved ? 'text-success' : 'text-foreground'
          }`}
        >
          {value}
        </motion.div>

        <Button
          variant="secondary"
          size="icon"
          onClick={handleIncrement}
          disabled={isLoading}
          className="w-12 h-12 text-xl"
        >
          +
        </Button>
      </div>

      {/* Achievement indicator */}
      {isAchieved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-success mb-4"
        >
          ✅ 目標達成！
        </motion.div>
      )}

      {/* Memo Input */}
      <div className="mb-4">
        <label className="text-caption text-muted-foreground mb-1 block">メモ (任意)</label>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="今日の一言..."
          maxLength={500}
          className="w-full px-3 py-2 text-body bg-secondary rounded-lg border-none outline-none focus:ring-2 focus:ring-accent"
          disabled={isLoading}
        />
      </div>

      {/* Record Button */}
      <Button
        variant={isAchieved ? 'accent' : 'primary'}
        className="w-full"
        onClick={handleRecord}
        disabled={isLoading}
      >
        {isLoading ? '記録中...' : '記録する'}
      </Button>

      {/* Success Animation */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-4 text-center text-success text-body-sm"
        >
          🎉 記録しました！
        </motion.div>
      )}
    </Card>
  )
}
