'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface ChallengeProgressProps {
  achievedDays: number
  totalDays: number
  remainingDays: number
}

export function ChallengeProgress({
  achievedDays,
  totalDays,
  remainingDays,
}: ChallengeProgressProps) {
  const progressPercent = totalDays > 0 ? (achievedDays / totalDays) * 100 : 0

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-body font-medium">
          {achievedDays}/{totalDays}日達成
        </span>
        <span className="text-body-sm text-muted-foreground">残り {remainingDays}日</span>
      </div>
      <Progress value={progressPercent} className="h-2" />
    </Card>
  )
}
