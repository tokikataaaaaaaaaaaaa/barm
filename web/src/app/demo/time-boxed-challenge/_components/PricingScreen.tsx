'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CHALLENGE_CONFIG } from '../_data/mock'

interface PricingScreenProps {
  onPurchase: (type: '1week' | '2week' | '1month') => void
  onBack: () => void
}

export function PricingScreen({ onPurchase, onBack }: PricingScreenProps) {
  const [selected, setSelected] = useState<'1week' | '2week' | '1month'>('2week')
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePurchase = () => {
    setIsProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      onPurchase(selected)
    }, 1500)
  }

  const plans = [
    { type: '1week' as const, popular: false, badge: null },
    { type: '2week' as const, popular: true, badge: '人気' },
    { type: '1month' as const, popular: false, badge: '最もお得' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container-mobile">
          <div className="flex h-14 items-center">
            <button
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← 戻る
            </button>
            <h1 className="flex-1 text-center font-display text-lg tracking-wide">
              次のチャレンジ
            </h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <main className="container-mobile py-6">
        <h2 className="text-body-lg font-medium mb-4">チャレンジを選択</h2>

        <div className="space-y-3 mb-8">
          {plans.map(({ type, popular, badge }) => {
            const config = CHALLENGE_CONFIG[type]
            const isSelected = selected === type

            return (
              <motion.div
                key={type}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-accent ring-2 ring-accent/20'
                      : 'hover:border-muted-foreground/50'
                  }`}
                  onClick={() => setSelected(type)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{config.icon}</span>
                      <div>
                        <h3 className="text-body font-medium">{config.label}</h3>
                        <p className="text-body-lg font-display text-accent mt-1">
                          ¥{config.price}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {badge && (
                        <Badge variant={popular ? 'accent' : 'secondary'} size="sm">
                          {badge}
                        </Badge>
                      )}
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-accent bg-accent'
                            : 'border-muted-foreground/50'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-accent-foreground"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Payment Section */}
        <div className="border-t border-border pt-6">
          <h2 className="text-body-lg font-medium mb-4">お支払い方法</h2>

          <p className="text-body-sm text-muted-foreground mb-4">
            Apple Pay で決済
          </p>

          <Button
            variant="primary"
            className="w-full h-12 bg-black hover:bg-gray-900"
            onClick={handlePurchase}
            isLoading={isProcessing}
          >
            {isProcessing ? (
              '処理中...'
            ) : (
              <span className="flex items-center gap-2">
                 Pay ¥{CHALLENGE_CONFIG[selected].price}
              </span>
            )}
          </Button>

          <p className="text-center text-caption text-muted-foreground mt-4">
            ※ RevenueCat 経由で処理されます
          </p>
        </div>
      </main>
    </div>
  )
}
