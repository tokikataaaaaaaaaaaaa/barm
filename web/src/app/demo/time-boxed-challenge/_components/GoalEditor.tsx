'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Goal,
  GOAL_CATEGORIES,
  GoalCategory,
  GoalOption,
} from '../_data/mock'

type Step = 'intro' | 'category' | 'details'

interface GoalEditorProps {
  currentGoal: Goal
  isOpen: boolean
  onClose: () => void
  onSave: (goal: Goal) => void
}

export function GoalEditor({
  currentGoal,
  isOpen,
  onClose,
  onSave,
}: GoalEditorProps) {
  const [step, setStep] = useState<Step>('intro')
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(null)
  const [targetValue, setTargetValue] = useState<number>(currentGoal.targetValue)
  const [customGoalName, setCustomGoalName] = useState('')
  const [customUnit, setCustomUnit] = useState('回')

  const reset = () => {
    setStep('intro')
    setSelectedCategory(null)
    setSelectedGoal(null)
    setTargetValue(currentGoal.targetValue)
    setCustomGoalName('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSave = () => {
    const goalName = selectedGoal?.name || customGoalName || currentGoal.name
    const unit = selectedGoal?.unit || customUnit
    const icon = selectedCategory?.icon || currentGoal.icon

    onSave({
      name: goalName,
      targetValue,
      unit,
      icon,
    })
    reset()
  }

  const goBack = () => {
    switch (step) {
      case 'category':
        setStep('intro')
        break
      case 'details':
        setStep('category')
        setSelectedGoal(null)
        setTargetValue(currentGoal.targetValue)
        break
    }
  }

  const getStepNumber = () => {
    switch (step) {
      case 'intro': return 1
      case 'category': return 2
      case 'details': return 3
      default: return 1
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
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container-mobile">
          <div className="flex h-14 items-center justify-between">
            <button
              onClick={step === 'intro' ? handleClose : goBack}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← 戻る
            </button>
            <span className="text-body-sm text-muted-foreground">
              目標を変更 ({getStepNumber()} / 3)
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

      <AnimatePresence mode="wait">
        {/* Step 1: Intro */}
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
                目標を変更
              </h1>
              <p className="text-body text-muted-foreground">
                難しすぎない目標を立てましょう
              </p>
            </div>

            {/* Current goal */}
            <Card className="mt-6 p-4 bg-secondary/50">
              <p className="text-body-sm text-muted-foreground mb-2">現在の目標</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentGoal.icon}</span>
                <p className="text-body font-medium">
                  {currentGoal.name} {currentGoal.targetValue}{currentGoal.unit}/日
                </p>
              </div>
            </Card>

            <Card className="mt-4 p-5 bg-accent/10 border-accent/30">
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
                新しい目標を選ぶ →
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Category Selection */}
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

        {/* Step 3: Goal Details */}
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
                    </div>

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
                onClick={handleSave}
              >
                {selectedGoal
                  ? `${selectedGoal.name} ${targetValue}${selectedGoal.unit}/日 に変更`
                  : customGoalName
                  ? `${customGoalName} ${targetValue}${customUnit}/日 に変更`
                  : '目標を変更する'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
