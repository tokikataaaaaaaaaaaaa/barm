'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Challenge, CHALLENGE_CONFIG, formatDateRange, GOAL_ICONS, UNIT_OPTIONS } from '../_data/mock'

interface ChallengeJoinModalProps {
  challenge: Challenge
  isOpen: boolean
  onClose: () => void
  onJoin: (goal: { name: string; targetValue: number; unit: string; icon: string }) => void
  isFirstChallenge?: boolean
}

export function ChallengeJoinModal({
  challenge,
  isOpen,
  onClose,
  onJoin,
  isFirstChallenge = true,
}: ChallengeJoinModalProps) {
  const config = CHALLENGE_CONFIG[challenge.type]
  const [goalName, setGoalName] = useState('')
  const [targetValue, setTargetValue] = useState(30)
  const [unit, setUnit] = useState('回')
  const [selectedIcon, setSelectedIcon] = useState('💪')

  const handleSubmit = () => {
    onJoin({
      name: goalName || '目標',
      targetValue,
      unit,
      icon: selectedIcon,
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 bottom-4 top-auto z-50 max-w-md mx-auto"
          >
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Header */}
              <div className="relative p-5 border-b border-border">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  ×
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{config.icon}</span>
                  <h2 className="font-display text-xl tracking-wide">
                    {config.label}に参加
                  </h2>
                </div>
                <p className="text-body-sm text-muted-foreground">
                  {formatDateRange(challenge.startDate, challenge.endDate)}
                </p>
              </div>

              {/* Form */}
              <div className="p-5 space-y-4">
                <h3 className="text-body font-medium">あなたの目標を設定</h3>

                {/* Icon selector */}
                <div className="flex gap-2 flex-wrap">
                  {GOAL_ICONS.map(({ icon }) => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                        selectedIcon === icon
                          ? 'bg-accent shadow-glow'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>

                {/* Goal name */}
                <div>
                  <label className="text-body-sm text-muted-foreground mb-1 block">
                    目標名
                  </label>
                  <Input
                    placeholder="例: 腕立て伏せ"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                  />
                </div>

                {/* Target value & unit */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-body-sm text-muted-foreground mb-1 block">
                      目標値
                    </label>
                    <Input
                      type="number"
                      value={targetValue}
                      onChange={(e) => setTargetValue(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-body-sm text-muted-foreground mb-1 block">
                      単位
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full h-11 rounded-xl bg-secondary border border-border px-3 text-body focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-border bg-secondary/30">
                {isFirstChallenge ? (
                  <p className="text-center text-body-sm text-success mb-3">
                    💡 初回チャレンジは無料！
                  </p>
                ) : (
                  <p className="text-center text-body-sm text-muted-foreground mb-3">
                    ※2回目以降: ¥{config.price}
                  </p>
                )}
                <Button
                  variant="accent"
                  className="w-full"
                  onClick={handleSubmit}
                >
                  参加する
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
