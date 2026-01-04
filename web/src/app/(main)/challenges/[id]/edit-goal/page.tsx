'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/hooks/use-auth'
import { useChallengeWithParticipation, useUpdateGoal } from '@/lib/hooks/use-challenges'
import {
  CHALLENGE_CONFIG,
  GOAL_CATEGORIES,
  TARGET_VALUE_PRESETS,
} from '@/components/features/challenge'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChallengeGoal, GoalCategory } from '@/lib/types'

interface EditGoalPageProps {
  params: Promise<{ id: string }>
}

export default function EditGoalPage({ params }: EditGoalPageProps) {
  const { id: challengeId } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const { challenge, participation, isLoading, error } = useChallengeWithParticipation(challengeId)
  const updateGoal = useUpdateGoal()

  const [goal, setGoal] = useState<ChallengeGoal | null>(null)
  const [customName, setCustomName] = useState('')
  const [customValue, setCustomValue] = useState('')
  const [customUnit, setCustomUnit] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  useEffect(() => {
    if (participation?.goal) {
      setGoal(participation.goal)
      setCustomValue(String(participation.goal.targetValue))
      setCustomUnit(participation.goal.unit)
    }
  }, [participation?.goal])

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

  // Only allow editing for upcoming challenges
  if (challenge.status !== 'upcoming') {
    return (
      <div className="min-h-screen bg-background p-6">
        <EmptyState
          icon="🔒"
          title="チャレンジ開始後は目標を変更できません"
          action={{ label: '戻る', onClick: () => router.push(`/challenges/${challengeId}`) }}
        />
      </div>
    )
  }

  const config = CHALLENGE_CONFIG[challenge.type]
  const presets = goal?.name ? TARGET_VALUE_PRESETS[goal.name] : null

  // Find all matching presets across categories
  const allPresets: { name: string; icon: string; category: GoalCategory }[] = []
  Object.entries(GOAL_CATEGORIES).forEach(([category, config]) => {
    config.presets.forEach((preset) => {
      allPresets.push({ ...preset, category: category as GoalCategory })
    })
  })

  const handlePresetSelect = (preset: { name: string; icon: string; category: GoalCategory }) => {
    const targetPreset = TARGET_VALUE_PRESETS[preset.name]
    setGoal({
      category: preset.category,
      name: preset.name,
      icon: preset.icon,
      targetValue: targetPreset?.recommended || 10,
      unit: targetPreset?.unit || '回',
    })
    setCustomValue(String(targetPreset?.recommended || 10))
    setCustomUnit(targetPreset?.unit || '回')
    setShowCustom(false)
  }

  const handleTargetChange = (value: number, unit: string) => {
    if (goal) {
      setGoal({ ...goal, targetValue: value, unit })
      setCustomValue(String(value))
      setCustomUnit(unit)
    }
  }

  const handleCustomTarget = () => {
    const value = parseFloat(customValue)
    if (isNaN(value) || value <= 0 || !customUnit.trim() || !goal) return
    setGoal({ ...goal, targetValue: value, unit: customUnit.trim() })
    setShowCustom(false)
  }

  const handleSave = async () => {
    if (!goal || !participation) return

    try {
      await updateGoal.mutateAsync({
        participationId: participation.id,
        input: { goal },
      })
      router.push(`/challenges/${challengeId}/waiting`)
    } catch (err) {
      console.error('Failed to update goal:', err)
    }
  }

  const hasChanges = goal && participation && (
    goal.name !== participation.goal.name ||
    goal.icon !== participation.goal.icon ||
    goal.targetValue !== participation.goal.targetValue ||
    goal.unit !== participation.goal.unit
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container-mobile">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/challenges/${challengeId}/waiting`}
                className="text-muted-foreground hover:text-foreground"
              >
                ←
              </Link>
              <h1 className="font-display text-lg tracking-wide">目標を編集</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container-mobile pb-24 py-6 space-y-6">
        {/* Current Goal */}
        {goal && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-5">
              <p className="text-body-sm text-muted-foreground mb-3">現在の目標</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{goal.icon}</span>
                <div>
                  <p className="text-body font-medium">{goal.name}</p>
                  <p className="text-body-sm text-muted-foreground">
                    {goal.targetValue}
                    {goal.unit}/日
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Goal Presets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-body font-medium mb-3">目標を選択</h3>
          <div className="grid grid-cols-2 gap-2">
            {allPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetSelect(preset)}
                className={`p-3 rounded-xl border transition-colors text-left ${
                  goal?.name === preset.name
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-card hover:border-accent/50'
                }`}
              >
                <span className="text-xl">{preset.icon}</span>
                <p className="text-body-sm mt-1">{preset.name}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Target Value */}
        {goal && presets && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-body font-medium mb-3">目標値</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {presets.values.map((value) => (
                <button
                  key={value}
                  onClick={() => handleTargetChange(value, presets.unit)}
                  className={`px-4 py-2 rounded-lg text-body-sm font-medium transition-colors ${
                    goal.targetValue === value && goal.unit === presets.unit
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {value}
                  {presets.unit}
                </button>
              ))}
              <button
                onClick={() => setShowCustom(!showCustom)}
                className="px-4 py-2 rounded-lg text-body-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                カスタム
              </button>
            </div>

            {showCustom && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex gap-2"
              >
                <input
                  type="number"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="数値"
                  min={1}
                  max={10000}
                  className="w-24 px-3 py-2 text-body bg-secondary rounded-lg border-none outline-none focus:ring-2 focus:ring-accent"
                />
                <input
                  type="text"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  placeholder="単位"
                  maxLength={20}
                  className="flex-1 px-3 py-2 text-body bg-secondary rounded-lg border-none outline-none focus:ring-2 focus:ring-accent"
                />
                <Button onClick={handleCustomTarget} disabled={!customValue || !customUnit.trim()}>
                  決定
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Save Button */}
        <div className="pt-4">
          <Button
            variant="accent"
            className="w-full"
            onClick={handleSave}
            disabled={!hasChanges || updateGoal.isPending}
          >
            {updateGoal.isPending ? '保存中...' : '変更を保存'}
          </Button>

          {updateGoal.isError && (
            <p className="text-danger text-body-sm text-center mt-2">
              {updateGoal.error?.message || '保存に失敗しました'}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
