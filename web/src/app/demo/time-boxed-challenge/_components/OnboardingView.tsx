'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Challenge,
  CHALLENGE_CONFIG,
  MIN_TEAM_SIZE,
  MAX_TEAM_SIZE,
} from '../_data/mock'

type Step = 'flow' | 'intro'

interface OnboardingViewProps {
  challenge: Challenge
  isOpen: boolean
  onClose: () => void
}

export function OnboardingView({
  challenge,
  isOpen,
  onClose,
}: OnboardingViewProps) {
  const config = CHALLENGE_CONFIG[challenge.type]
  const [step, setStep] = useState<Step>('flow')

  const handleClose = () => {
    setStep('flow')
    onClose()
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
              onClick={step === 'intro' ? () => setStep('flow') : handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← 戻る
            </button>
            <span className="text-body-sm text-muted-foreground">
              {step === 'flow' ? '1' : '2'} / 2
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
        {/* Step 1: Challenge Flow */}
        {step === 'flow' && (
          <motion.div
            key="flow"
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

        {/* Step 2: Small Steps Intro */}
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
                onClick={handleClose}
              >
                ← 戻る
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
