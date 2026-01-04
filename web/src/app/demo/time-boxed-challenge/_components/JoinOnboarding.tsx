'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import {
  Challenge,
  CHALLENGE_CONFIG,
  formatDateRange,
  GOAL_CATEGORIES,
  GoalCategory,
  GoalOption,
  MOCK_USERS,
  MIN_TEAM_SIZE,
  MAX_TEAM_SIZE,
} from '../_data/mock'

type Step = 'confirm' | 'onboarding' | 'intro' | 'category' | 'details' | 'complete'

interface JoinOnboardingProps {
  challenge: Challenge
  isOpen: boolean
  onClose: () => void
  onComplete: (goal: { name: string; targetValue: number; unit: string; icon: string }) => void
  isFirstChallenge?: boolean
}

export function JoinOnboarding({
  challenge,
  isOpen,
  onClose,
  onComplete,
  isFirstChallenge = true,
}: JoinOnboardingProps) {
  const config = CHALLENGE_CONFIG[challenge.type]
  const [step, setStep] = useState<Step>('confirm')
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(null)
  const [targetValue, setTargetValue] = useState<number>(0)
  const [customGoalName, setCustomGoalName] = useState('')
  const [customUnit, setCustomUnit] = useState('回')

  const reset = () => {
    setStep('confirm')
    setSelectedCategory(null)
    setSelectedGoal(null)
    setTargetValue(0)
    setCustomGoalName('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleComplete = () => {
    const goalName = selectedGoal?.name || customGoalName || '目標'
    const unit = selectedGoal?.unit || customUnit
    const icon = selectedCategory?.icon || '✏️'

    onComplete({
      name: goalName,
      targetValue,
      unit,
      icon,
    })
    reset()
  }

  const goBack = () => {
    switch (step) {
      case 'onboarding':
        setStep('confirm')
        break
      case 'intro':
        setStep('onboarding')
        break
      case 'category':
        setStep('intro')
        break
      case 'details':
        setStep('category')
        setSelectedGoal(null)
        setTargetValue(0)
        break
    }
  }

  const getStepNumber = () => {
    switch (step) {
      case 'onboarding': return 1
      case 'intro': return 2
      case 'category': return 3
      case 'details': return 4
      default: return 0
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background"
    >
      {/* Header */}
      {step !== 'confirm' && step !== 'complete' && (
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-lg">
          <div className="container-mobile">
            <div className="flex h-14 items-center justify-between">
              <button
                onClick={goBack}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ← 戻る
              </button>
              <span className="text-body-sm text-muted-foreground">
                Step {getStepNumber()} of 4
              </span>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </header>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Confirm */}
        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container-mobile py-8"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-2xl text-muted-foreground hover:text-foreground"
            >
              ×
            </button>

            <div className="text-center pt-12">
              <span className="text-6xl mb-6 block">{config.icon}</span>
              <h1 className="font-display text-2xl tracking-wide mb-2">
                {config.label}に
              </h1>
              <h1 className="font-display text-2xl tracking-wide mb-4">
                参加しますか？
              </h1>
              <p className="text-body text-muted-foreground">
                {formatDateRange(challenge.startDate, challenge.endDate)}
              </p>
            </div>

            <Card className="mt-8 p-4 bg-warning/10 border-warning/30">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-body font-medium text-warning">注意</p>
                  <p className="text-body-sm text-muted-foreground mt-1">
                    チャレンジ開始後は途中でキャンセルできません。
                    {config.days}日間、仲間と一緒に頑張りましょう！
                  </p>
                </div>
              </div>
            </Card>

            <div className="mt-auto pt-12 space-y-3">
              <Button
                variant="accent"
                className="w-full"
                onClick={() => setStep('onboarding')}
              >
                参加する →
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleClose}
              >
                やめておく
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Onboarding */}
        {step === 'onboarding' && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="container-mobile py-8"
          >
            <div className="text-center pt-4">
              <span className="text-5xl mb-4 block">📅</span>
              <h1 className="font-display text-2xl tracking-wide mb-6">
                チャレンジの流れ
              </h1>
            </div>

            <div className="space-y-4">
              {[
                { num: '1️⃣', title: '目標を設定', desc: '毎日の小さな目標を決めます' },
                { num: '2️⃣', title: 'チームに振り分け', desc: `開始日に${MIN_TEAM_SIZE}〜${MAX_TEAM_SIZE}人のチームへ` },
                { num: '3️⃣', title: '毎日記録', desc: '達成したら記録をつけます' },
                { num: '4️⃣', title: '仲間と頑張る', desc: 'チームメンバーの進捗も見えます' },
                { num: '5️⃣', title: '完走を目指す', desc: `${config.days}日間続けてゴール！` },
              ].map((item) => (
                <Card key={item.num} className="p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{item.num}</span>
                    <div>
                      <p className="text-body font-medium">{item.title}</p>
                      <p className="text-body-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Notification info */}
            <Card className="mt-4 p-4 bg-accent/10 border-accent/30">
              <div className="flex items-start gap-3">
                <span className="text-xl">🔔</span>
                <div>
                  <p className="text-body font-medium">通知でリマインド</p>
                  <p className="text-body-sm text-muted-foreground">
                    毎日決まった時間にリマインダーが届きます。
                    時間は参加後に設定できます。
                  </p>
                </div>
              </div>
            </Card>

            <div className="mt-8">
              <Button
                variant="accent"
                className="w-full"
                onClick={() => setStep('intro')}
              >
                次へ →
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Intro */}
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="container-mobile py-8"
          >
            <div className="text-center pt-4">
              <span className="text-5xl mb-4 block">🌱</span>
              <h1 className="font-display text-2xl tracking-wide mb-2">
                まずは小さな一歩から
              </h1>
              <p className="text-body text-muted-foreground">
                難しすぎない目標を立てましょう
              </p>
            </div>

            <Card className="mt-8 p-5 bg-accent/10 border-accent/30">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <p className="text-body font-medium">コツ</p>
                  <p className="text-body-sm text-muted-foreground mt-2">
                    「絶対できる」と思えるレベルから始めましょう
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-body-sm text-muted-foreground">例: 腕立て 15回/日</p>
                    <p className="text-body-sm text-muted-foreground">例: 読書 10分/日</p>
                    <p className="text-body-sm text-muted-foreground">例: 散歩 3000歩/日</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="mt-8">
              <Button
                variant="accent"
                className="w-full"
                onClick={() => setStep('category')}
              >
                目標を決める →
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Category Selection */}
        {step === 'category' && (
          <motion.div
            key="category"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="container-mobile py-8"
          >
            <h1 className="font-display text-xl tracking-wide mb-6 text-center">
              どんなことを目標にしますか？
            </h1>

            <div className="space-y-3">
              {GOAL_CATEGORIES.map((category) => (
                <motion.div
                  key={category.id}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    interactive
                    className="p-4"
                    onClick={() => {
                      setSelectedCategory(category)
                      setStep('details')
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{category.icon}</span>
                      <div className="flex-1">
                        <p className="text-body font-medium">{category.label}</p>
                        <p className="text-body-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                      <span className="text-muted-foreground">→</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 5: Goal Details */}
        {step === 'details' && selectedCategory && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="container-mobile py-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">{selectedCategory.icon}</span>
              <h1 className="font-display text-xl tracking-wide">
                {selectedCategory.label}
              </h1>
            </div>

            {selectedCategory.goals.length > 0 ? (
              <>
                <p className="text-body-sm text-muted-foreground mb-3">
                  何をしますか？
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedCategory.goals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => {
                        setSelectedGoal(goal)
                        setTargetValue(goal.recommended)
                      }}
                      className={`px-4 py-2 rounded-xl text-body-sm font-medium transition-all ${
                        selectedGoal?.id === goal.id
                          ? 'bg-accent text-accent-foreground shadow-glow'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {goal.name}
                    </button>
                  ))}
                </div>

                {selectedGoal && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-body-sm text-muted-foreground mb-3">
                      1日何{selectedGoal.unit}？
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedGoal.presets.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setTargetValue(preset)}
                          className={`px-4 py-2 rounded-xl text-body-sm font-medium transition-all ${
                            targetValue === preset
                              ? 'bg-accent text-accent-foreground shadow-glow'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                        >
                          {preset}{selectedGoal.unit}
                          {preset === selectedGoal.recommended && ' ⭐'}
                        </button>
                      ))}
                      <button
                        onClick={() => setTargetValue(0)}
                        className={`px-4 py-2 rounded-xl text-body-sm font-medium transition-all ${
                          !selectedGoal.presets.includes(targetValue) && targetValue !== 0
                            ? 'bg-accent text-accent-foreground shadow-glow'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        カスタム
                      </button>
                    </div>

                    {targetValue === 0 && (
                      <Input
                        type="number"
                        placeholder="目標値を入力"
                        className="mb-4"
                        onChange={(e) => setTargetValue(Number(e.target.value))}
                      />
                    )}

                    <p className="text-body-sm text-accent mb-6">
                      💡 初回は {selectedGoal.recommended}{selectedGoal.unit} がおすすめ
                    </p>
                  </motion.div>
                )}
              </>
            ) : (
              /* Custom goal */
              <div className="space-y-4">
                <div>
                  <label className="text-body-sm text-muted-foreground mb-2 block">
                    目標名
                  </label>
                  <Input
                    placeholder="例: プログラミング学習"
                    value={customGoalName}
                    onChange={(e) => setCustomGoalName(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-body-sm text-muted-foreground mb-2 block">
                      目標値
                    </label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={targetValue || ''}
                      onChange={(e) => setTargetValue(Number(e.target.value))}
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-body-sm text-muted-foreground mb-2 block">
                      単位
                    </label>
                    <select
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      className="w-full h-11 rounded-xl bg-secondary border border-border px-3 text-body"
                    >
                      <option value="回">回</option>
                      <option value="分">分</option>
                      <option value="秒">秒</option>
                      <option value="km">km</option>
                      <option value="歩">歩</option>
                      <option value="ページ">ページ</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 space-y-3">
              <Button
                variant="accent"
                className="w-full"
                disabled={!targetValue || targetValue <= 0}
                onClick={() => setStep('complete')}
              >
                {selectedGoal
                  ? `${selectedGoal.name} ${targetValue}${selectedGoal.unit}/日 で参加 →`
                  : customGoalName
                  ? `${customGoalName} ${targetValue}${customUnit}/日 で参加 →`
                  : '参加する →'}
              </Button>

              {isFirstChallenge && (
                <p className="text-center text-body-sm text-success">
                  💡 初回チャレンジは無料！
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 6: Complete */}
        {step === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="container-mobile py-8 text-center"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
              className="text-6xl block mb-6 pt-12"
            >
              🎉
            </motion.span>

            <h1 className="font-display text-2xl tracking-wide mb-2">
              チャレンジに参加しました！
            </h1>

            <Card className="mt-8 p-5">
              <p className="text-body-sm text-muted-foreground mb-2">あなたの目標</p>
              <p className="text-heading flex items-center justify-center gap-2">
                <span>{selectedCategory?.icon}</span>
                <span>
                  {selectedGoal?.name || customGoalName} {targetValue}
                  {selectedGoal?.unit || customUnit}/日
                </span>
              </p>
              <p className="text-body-sm text-muted-foreground mt-4">
                期間: {formatDateRange(challenge.startDate, challenge.endDate)} ({config.days}日間)
              </p>
            </Card>

            <div className="mt-6">
              <p className="text-body-sm text-muted-foreground mb-2">
                現在 {challenge.participantCount}人 が参加中
              </p>
              <div className="flex justify-center -space-x-2">
                {MOCK_USERS.slice(0, 5).map((user) => (
                  <Avatar
                    key={user.id}
                    fallback={user.name.charAt(0)}
                    size="sm"
                    className="border-2 border-card"
                  />
                ))}
                {challenge.participantCount > 5 && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground border-2 border-card">
                    +{challenge.participantCount - 5}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8">
              <Button
                variant="accent"
                className="w-full"
                onClick={handleComplete}
              >
                さっそく記録する →
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
