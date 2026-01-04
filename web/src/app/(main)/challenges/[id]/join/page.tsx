'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/hooks/use-auth'
import { useChallenge, useJoinChallenge } from '@/lib/hooks/use-challenges'
import {
  CHALLENGE_CONFIG,
  GOAL_CATEGORIES,
  TARGET_VALUE_PRESETS,
  formatDateRange,
} from '@/components/features/challenge'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GoalCategory, ChallengeGoal } from '@/lib/types'

interface JoinPageProps {
  params: Promise<{ id: string }>
}

type JoinStep = 'category' | 'goal' | 'target' | 'confirm'

export default function JoinPage({ params }: JoinPageProps) {
  const { id: challengeId } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const { data: challenge, isLoading, error } = useChallenge(challengeId)
  const joinChallenge = useJoinChallenge()

  const [step, setStep] = useState<JoinStep>('category')
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | null>(null)
  const [goal, setGoal] = useState<Partial<ChallengeGoal>>({})
  const [customName, setCustomName] = useState('')
  const [customUnit, setCustomUnit] = useState('')
  const [customValue, setCustomValue] = useState('')

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

  if (challenge.status !== 'upcoming') {
    return (
      <div className="min-h-screen bg-background p-6">
        <EmptyState
          icon="⏰"
          title="このチャレンジは参加受付を終了しました"
          action={{ label: '一覧に戻る', onClick: () => router.push('/challenges') }}
        />
      </div>
    )
  }

  const config = CHALLENGE_CONFIG[challenge.type]
  const categoryConfig = selectedCategory ? GOAL_CATEGORIES[selectedCategory] : null
  const presets = goal.name ? TARGET_VALUE_PRESETS[goal.name] : null

  const handleCategorySelect = (category: GoalCategory) => {
    setSelectedCategory(category)
    setGoal({ category })
    if (category === 'other') {
      setStep('goal')
    } else {
      setStep('goal')
    }
  }

  const handleGoalSelect = (preset: { name: string; icon: string }) => {
    if (!selectedCategory) return
    setGoal({ category: selectedCategory, name: preset.name, icon: preset.icon })
    setStep('target')
  }

  const handleCustomGoal = () => {
    if (!customName.trim() || !selectedCategory) return
    setGoal({
      category: selectedCategory,
      name: customName.trim(),
      icon: categoryConfig?.icon || '🎯',
    })
    setStep('target')
  }

  const handleTargetSelect = (value: number, unit: string) => {
    setGoal((prev) => ({ ...prev, targetValue: value, unit }))
    setStep('confirm')
  }

  const handleCustomTarget = () => {
    const value = parseFloat(customValue)
    if (isNaN(value) || value <= 0 || !customUnit.trim()) return
    setGoal((prev) => ({ ...prev, targetValue: value, unit: customUnit.trim() }))
    setStep('confirm')
  }

  const handleJoin = async () => {
    if (!goal.category || !goal.name || !goal.icon || !goal.targetValue || !goal.unit) return

    try {
      await joinChallenge.mutateAsync({
        challengeId: challenge.id,
        goal: goal as ChallengeGoal,
      })
      router.push(`/challenges/${challengeId}/waiting`)
    } catch (err) {
      console.error('Failed to join challenge:', err)
    }
  }

  const handleBack = () => {
    if (step === 'goal') {
      setStep('category')
      setSelectedCategory(null)
    } else if (step === 'target') {
      setStep('goal')
    } else if (step === 'confirm') {
      setStep('target')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container-mobile">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              {step === 'category' ? (
                <Link href="/challenges" className="text-muted-foreground hover:text-foreground">
                  ←
                </Link>
              ) : (
                <button onClick={handleBack} className="text-muted-foreground hover:text-foreground">
                  ←
                </button>
              )}
              <h1 className="font-display text-lg tracking-wide">{config.label}に参加</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container-mobile pb-24 py-6 space-y-6">
        {/* Challenge Info */}
        <Card className="p-4 flex items-center gap-3">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h3 className="text-body font-medium">{config.label}</h3>
            <p className="text-caption text-muted-foreground">
              {formatDateRange(challenge.startDate, challenge.endDate)}
            </p>
          </div>
        </Card>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          {(['category', 'goal', 'target', 'confirm'] as JoinStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-body-sm font-medium transition-colors ${
                  step === s
                    ? 'bg-accent text-accent-foreground'
                    : i < ['category', 'goal', 'target', 'confirm'].indexOf(step)
                      ? 'bg-success text-white'
                      : 'bg-secondary text-muted-foreground'
                }`}
              >
                {i < ['category', 'goal', 'target', 'confirm'].indexOf(step) ? '✓' : i + 1}
              </div>
              {i < 3 && <div className="w-8 h-0.5 bg-secondary" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Category Selection */}
          {step === 'category' && (
            <motion.div
              key="category"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-body font-medium mb-1">目標のカテゴリを選択</h2>
                <p className="text-body-sm text-muted-foreground">
                  どんな種類の目標を設定しますか？
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(GOAL_CATEGORIES) as [GoalCategory, typeof GOAL_CATEGORIES[GoalCategory]][]).map(
                  ([key, category]) => (
                    <button
                      key={key}
                      onClick={() => handleCategorySelect(key)}
                      className="p-4 rounded-xl bg-card border border-border hover:border-accent transition-colors text-left"
                    >
                      <span className="text-2xl block mb-2">{category.icon}</span>
                      <p className="text-body font-medium">{category.label}</p>
                      <p className="text-caption text-muted-foreground">{category.description}</p>
                    </button>
                  )
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Goal Selection */}
          {step === 'goal' && categoryConfig && (
            <motion.div
              key="goal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-body font-medium mb-1">目標を選択</h2>
                <p className="text-body-sm text-muted-foreground">
                  毎日達成する目標を選んでください
                </p>
              </div>

              {categoryConfig.presets.length > 0 && (
                <div className="space-y-2">
                  {categoryConfig.presets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleGoalSelect(preset)}
                      className="w-full p-4 rounded-xl bg-card border border-border hover:border-accent transition-colors text-left flex items-center gap-3"
                    >
                      <span className="text-2xl">{preset.icon}</span>
                      <p className="text-body font-medium">{preset.name}</p>
                    </button>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <p className="text-body-sm text-muted-foreground mb-3">
                  または、自分で入力
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="目標名を入力..."
                    maxLength={100}
                    className="flex-1 px-3 py-2 text-body bg-secondary rounded-lg border-none outline-none focus:ring-2 focus:ring-accent"
                  />
                  <Button onClick={handleCustomGoal} disabled={!customName.trim()}>
                    決定
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Target Value */}
          {step === 'target' && (
            <motion.div
              key="target"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-body font-medium mb-1">目標値を設定</h2>
                <p className="text-body-sm text-muted-foreground">
                  {goal.icon} {goal.name} を1日どれくらいやりますか？
                </p>
              </div>

              {presets ? (
                <div className="space-y-2">
                  {presets.values.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleTargetSelect(value, presets.unit)}
                      className={`w-full p-4 rounded-xl bg-card border transition-colors text-left ${
                        value === presets.recommended
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-accent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-body font-medium">
                          {value}
                          {presets.unit}/日
                        </p>
                        {value === presets.recommended && (
                          <span className="text-caption text-accent">おすすめ</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="pt-4 border-t border-border">
                <p className="text-body-sm text-muted-foreground mb-3">
                  または、自分で入力
                </p>
                <div className="flex gap-2">
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
                    placeholder="単位 (回, 分, km...)"
                    maxLength={20}
                    className="flex-1 px-3 py-2 text-body bg-secondary rounded-lg border-none outline-none focus:ring-2 focus:ring-accent"
                  />
                  <Button onClick={handleCustomTarget} disabled={!customValue || !customUnit.trim()}>
                    決定
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-body font-medium mb-1">内容を確認</h2>
                <p className="text-body-sm text-muted-foreground">
                  この内容でチャレンジに参加しますか？
                </p>
              </div>

              <Card className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{goal.icon}</span>
                  <div>
                    <p className="text-lg font-medium">{goal.name}</p>
                    <p className="text-body-sm text-muted-foreground">
                      {goal.targetValue}
                      {goal.unit}/日
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-body-sm">
                    <span className="text-muted-foreground">チャレンジ</span>
                    <span>{config.label}</span>
                  </div>
                  <div className="flex justify-between text-body-sm">
                    <span className="text-muted-foreground">期間</span>
                    <span>{formatDateRange(challenge.startDate, challenge.endDate)}</span>
                  </div>
                  <div className="flex justify-between text-body-sm">
                    <span className="text-muted-foreground">参加者</span>
                    <span>{challenge.participantCount}人</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-accent/10 border-accent/30">
                <p className="text-body-sm text-center">
                  参加後も開始前であれば目標の変更・辞退が可能です
                </p>
              </Card>

              <Button
                variant="accent"
                className="w-full"
                onClick={handleJoin}
                disabled={joinChallenge.isPending}
              >
                {joinChallenge.isPending ? '参加中...' : 'チャレンジに参加する'}
              </Button>

              {joinChallenge.isError && (
                <p className="text-danger text-body-sm text-center">
                  {joinChallenge.error?.message || '参加に失敗しました'}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
