'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Mission, Record } from '@/lib/types'

interface MissionCardProps {
  mission: Mission
  record?: Record
  streak?: number
  onRecordUpdate: (value: number) => void
}

export function MissionCard({ mission, record, streak, onRecordUpdate }: MissionCardProps) {
  const router = useRouter()
  const [value, setValue] = useState(record?.value ?? 0)
  const [isSaving, setIsSaving] = useState(false)

  const percentage = Math.min((value / mission.targetValue) * 100, 100)
  const isCompleted = value >= mission.targetValue

  const handleIncrement = useCallback(async () => {
    const newValue = Math.min(value + 1, mission.targetValue * 2)
    setValue(newValue)
    setIsSaving(true)
    try {
      await onRecordUpdate(newValue)
    } finally {
      setIsSaving(false)
    }
  }, [value, mission.targetValue, onRecordUpdate])

  const handleDecrement = useCallback(async () => {
    const newValue = Math.max(value - 1, 0)
    setValue(newValue)
    setIsSaving(true)
    try {
      await onRecordUpdate(newValue)
    } finally {
      setIsSaving(false)
    }
  }, [value, onRecordUpdate])

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    router.push(`/mission/${mission.id}`)
  }

  return (
    <Card
      className={cn(
        'overflow-hidden transition-colors cursor-pointer',
        isCompleted && 'border-green-500 bg-green-50 dark:bg-green-950/20'
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-block h-2 w-2 rounded-full',
                  mission.type === 'workout' ? 'bg-orange-500' : 'bg-blue-500'
                )}
              />
              <h3 className="font-medium">{mission.name}</h3>
              {streak !== undefined && streak > 0 && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  {'>'}{streak}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {value} / {mission.targetValue} {mission.unit}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={value <= 0 || isSaving}
            >
              -
            </Button>
            <Button
              variant="primary"
              size="icon"
              onClick={handleIncrement}
              disabled={isSaving}
            >
              +
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className={cn(
              'h-full transition-all duration-300',
              isCompleted ? 'bg-green-500' : 'bg-zinc-900 dark:bg-zinc-50'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
