'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { ChallengeResultData, getResultType, MOCK_CURRENT_USER } from '../_data/mock'

interface ChallengeResultProps {
  result: ChallengeResultData
  goalDescription: string
  onNextChallenge: () => void
  onGoHome: () => void
}

export function ChallengeResult({
  result,
  goalDescription,
  onNextChallenge,
  onGoHome,
}: ChallengeResultProps) {
  const resultType = getResultType(result.achievedDays, result.totalDays)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (resultType === 'completed') {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [resultType])

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                rotate: 0,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: Math.random() * 720 - 360,
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                delay: Math.random() * 0.5,
                ease: 'linear',
              }}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][
                  Math.floor(Math.random() * 5)
                ],
              }}
            />
          ))}
        </div>
      )}

      {/* Result Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-6xl mb-4"
        >
          {resultType === 'completed' ? '🎉' : resultType === 'almost' ? '💪' : '😢'}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-3xl tracking-wide mb-2"
        >
          {resultType === 'completed'
            ? 'CHALLENGE COMPLETED'
            : resultType === 'almost'
            ? '惜しい！'
            : 'ドンマイ！'}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-xs my-6"
        >
          <div className="h-px bg-border mb-6" />
          <p className="font-display text-5xl text-accent mb-2">
            {result.achievedDays}/{result.totalDays}日
          </p>
          <p className="text-body text-muted-foreground">達成</p>
          <div className="h-px bg-border mt-6" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-8"
        >
          <p className="text-body text-muted-foreground">
            「{goalDescription}」を
            <br />
            1週間続けた
          </p>
        </motion.div>
      </div>

      {/* Rankings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="px-6 py-4 border-t border-border"
      >
        <h3 className="text-body-sm text-muted-foreground mb-3">仲間の結果</h3>
        <div className="space-y-2">
          {result.rankings.slice(0, 4).map((ranking, index) => (
            <div
              key={ranking.user.id}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                ranking.user.id === MOCK_CURRENT_USER.id
                  ? 'bg-accent/10'
                  : ''
              }`}
            >
              <span className="text-lg w-6 text-center">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
              </span>
              <Avatar fallback={ranking.user.name.charAt(0)} size="xs" />
              <span className="flex-1 text-body-sm">{ranking.user.name}</span>
              <span className="text-body-sm font-medium">
                {ranking.achievedDays}/{ranking.totalDays}日
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="p-6 space-y-3"
      >
        <p className="text-center text-body-sm text-muted-foreground mb-2">
          次のチャレンジに挑戦しよう！
        </p>
        <Button variant="accent" className="w-full" onClick={onNextChallenge}>
          次に挑戦する →
        </Button>
        <Button variant="ghost" className="w-full" onClick={onGoHome}>
          ホームに戻る
        </Button>
      </motion.div>
    </div>
  )
}
