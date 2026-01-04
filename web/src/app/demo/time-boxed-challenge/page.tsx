'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { LiveIndicator } from '@/components/patterns/feed-card'
import {
  ChallengeCard,
  JoinOnboarding,
  OnboardingView,
  GoalEditor,
  ChallengeDetail,
  ChallengeResult,
  PricingScreen,
  WaitingScreen,
} from './_components'
import {
  MOCK_CHALLENGES,
  MOCK_USERS,
  MOCK_PARTICIPANTS,
  MOCK_MY_PARTICIPATION,
  MOCK_MY_PARTICIPATION_WAITING,
  MOCK_RESULT_COMPLETED,
  MOCK_RESULT_ALMOST,
  Challenge,
  Goal,
} from './_data/mock'

type DemoScene =
  | 'list'
  | 'waiting'
  | 'detail'
  | 'result-completed'
  | 'result-almost'
  | 'pricing'

type DemoState = 'loading' | 'loaded' | 'error'

// Separate component to avoid TypeScript narrowing issues
function DemoControls({
  scene,
  state,
  setScene,
  setState,
  setIsJoined,
}: {
  scene: DemoScene
  state: DemoState
  setScene: (s: DemoScene) => void
  setState: (s: DemoState) => void
  setIsJoined: (j: boolean) => void
}) {
  return (
    <div className="bg-secondary/50 border-b border-border px-4 py-3">
      <div className="max-w-md mx-auto">
        <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
          <Badge
            variant={scene === 'list' ? 'accent' : 'secondary'}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => { setScene('list'); setIsJoined(false) }}
          >
            一覧
          </Badge>
          <Badge
            variant={scene === 'waiting' ? 'accent' : 'secondary'}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => { setScene('waiting'); setIsJoined(true) }}
          >
            待機中
          </Badge>
          <Badge
            variant={scene === 'detail' ? 'accent' : 'secondary'}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => { setScene('detail'); setIsJoined(true) }}
          >
            詳細
          </Badge>
          <Badge
            variant={scene === 'result-completed' ? 'accent' : 'secondary'}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setScene('result-completed')}
          >
            結果(完走)
          </Badge>
          <Badge
            variant={scene === 'result-almost' ? 'accent' : 'secondary'}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setScene('result-almost')}
          >
            結果(惜しい)
          </Badge>
          <Badge
            variant={scene === 'pricing' ? 'accent' : 'secondary'}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setScene('pricing')}
          >
            課金
          </Badge>
        </div>
        <div className="flex gap-2">
          <Badge
            variant={state === 'loaded' ? 'success' : 'secondary'}
            size="sm"
            className="cursor-pointer"
            onClick={() => setState('loaded')}
          >
            Loaded
          </Badge>
          <Badge
            variant={state === 'loading' ? 'warning' : 'secondary'}
            size="sm"
            className="cursor-pointer"
            onClick={() => setState('loading')}
          >
            Loading
          </Badge>
          <Badge
            variant={state === 'error' ? 'danger' : 'secondary'}
            size="sm"
            className="cursor-pointer"
            onClick={() => setState('error')}
          >
            Error
          </Badge>
        </div>
      </div>
    </div>
  )
}

export default function TimeBoxedChallengeDemo() {
  const [scene, setScene] = useState<DemoScene>('list')
  const [state, setState] = useState<DemoState>('loaded')
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [isJoined, setIsJoined] = useState(false)
  const [showOnboardingAgain, setShowOnboardingAgain] = useState(false)
  const [showGoalEditor, setShowGoalEditor] = useState(false)

  // Handle scene navigation
  const handleJoinClick = (challenge: Challenge) => {
    if (isJoined) {
      // Check if challenge is upcoming or active
      if (challenge.status === 'upcoming') {
        setSelectedChallenge(challenge)
        setScene('waiting')
      } else {
        setSelectedChallenge(challenge)
        setScene('detail')
      }
    } else {
      setSelectedChallenge(challenge)
      setJoinModalOpen(true)
    }
  }

  const handleJoin = (goal: Goal) => {
    setJoinModalOpen(false)
    setIsJoined(true)
    // Go to waiting screen if challenge hasn't started yet
    const challenge = selectedChallenge || MOCK_CHALLENGES[0]
    if (challenge.status === 'upcoming') {
      setScene('waiting')
    } else {
      setScene('detail')
    }
  }

  const handleShowOnboarding = () => {
    setShowOnboardingAgain(true)
  }

  const handleWithdraw = () => {
    setIsJoined(false)
    setScene('list')
  }

  const handleNotificationChange = (time: string, enabled: boolean) => {
    console.log('Notification changed:', time, enabled)
  }

  const handleEditGoal = () => {
    setShowGoalEditor(true)
  }

  const handleGoalSave = (goal: Goal) => {
    console.log('Goal saved:', goal)
    setShowGoalEditor(false)
    // In real app, this would update the participation data
  }

  const handleComplete = () => {
    setScene('result-completed')
  }

  const handleNextChallenge = () => {
    setScene('pricing')
  }

  const handlePurchase = () => {
    setScene('list')
    setIsJoined(true)
  }

  // Render based on scene
  const renderScene = () => {
    if (state === 'loading') {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
        </div>
      )
    }

    if (state === 'error') {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground mb-4">エラーが発生しました</p>
          <Button variant="outline" onClick={() => setState('loaded')}>
            再試行
          </Button>
        </div>
      )
    }

    switch (scene) {
      case 'list':
        return (
          <div className="space-y-3">
            {MOCK_CHALLENGES.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                participants={MOCK_USERS.slice(0, 5)}
                onJoin={() => handleJoinClick(challenge)}
                isJoined={isJoined && challenge.id === selectedChallenge?.id}
              />
            ))}
          </div>
        )

      case 'waiting':
        return (
          <WaitingScreen
            challenge={selectedChallenge || MOCK_CHALLENGES[1]}
            participation={MOCK_MY_PARTICIPATION_WAITING}
            onWithdraw={handleWithdraw}
            onShowOnboarding={handleShowOnboarding}
            onNotificationChange={handleNotificationChange}
            onEditGoal={handleEditGoal}
          />
        )

      case 'detail':
        return (
          <ChallengeDetail
            challenge={selectedChallenge || MOCK_CHALLENGES[0]}
            participation={MOCK_MY_PARTICIPATION}
            participants={MOCK_PARTICIPANTS}
            onRecordUpdate={(value) => console.log('Record:', value)}
            onComplete={handleComplete}
            onShowOnboarding={handleShowOnboarding}
            onNotificationChange={handleNotificationChange}
          />
        )

      case 'result-completed':
        return (
          <ChallengeResult
            result={MOCK_RESULT_COMPLETED}
            goalDescription="腕立て 50回/日"
            onNextChallenge={handleNextChallenge}
            onGoHome={() => setScene('list')}
          />
        )

      case 'result-almost':
        return (
          <ChallengeResult
            result={MOCK_RESULT_ALMOST}
            goalDescription="腕立て 50回/日"
            onNextChallenge={handleNextChallenge}
            onGoHome={() => setScene('list')}
          />
        )

      case 'pricing':
        return (
          <PricingScreen
            onPurchase={handlePurchase}
            onBack={() => setScene('result-completed')}
          />
        )
    }
  }

  // Full-screen views
  if (scene === 'pricing') {
    return (
      <div className="min-h-screen bg-background">
        {/* Demo Banner */}
        <div className="bg-warning/20 border-b border-warning/30 px-4 py-2">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="sm">DEMO</Badge>
              <span className="text-sm font-medium">Time-Boxed Challenge</span>
            </div>
            <button
              onClick={() => setScene('list')}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          </div>
        </div>
        {renderScene()}
      </div>
    )
  }

  if (scene === 'result-completed' || scene === 'result-almost') {
    return (
      <div className="min-h-screen bg-background">
        {/* Demo Banner */}
        <div className="bg-warning/20 border-b border-warning/30 px-4 py-2">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="sm">DEMO</Badge>
              <span className="text-sm font-medium">Time-Boxed Challenge</span>
            </div>
            <button
              onClick={() => setScene('list')}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          </div>
        </div>
        {renderScene()}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Banner */}
      <div className="bg-warning/20 border-b border-warning/30 px-4 py-2">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="warning" size="sm">DEMO</Badge>
            <span className="text-sm font-medium">Time-Boxed Challenge</span>
          </div>
          <a
            href="/docs/features/time-boxed-challenge/prd.md"
            className="text-sm text-warning underline hover:no-underline"
          >
            View PRD
          </a>
        </div>
      </div>

      {/* Demo Controls */}
      <DemoControls
        scene={scene}
        state={state}
        setScene={setScene}
        setState={setState}
        setIsJoined={setIsJoined}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container-mobile">
          <div className="flex h-14 items-center justify-between">
            {scene === 'detail' ? (
              <>
                <button
                  onClick={() => setScene('list')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ← 戻る
                </button>
                <h1 className="font-display text-lg tracking-wide">1週間チャレンジ</h1>
                <button className="text-muted-foreground">共有</button>
              </>
            ) : (
              <>
                <h1 className="font-display text-2xl tracking-wide">BARM</h1>
                <div className="flex items-center gap-3">
                  <LiveIndicator />
                  <Avatar fallback="G" size="sm" />
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Tab Switcher (List view only) */}
      {scene === 'list' && (
        <div className="container-mobile pt-4">
          <div className="flex gap-2 mb-6">
            <button className="flex-1 py-3 px-4 rounded-xl font-medium text-sm bg-secondary text-muted-foreground">
              🔥 みんなの記録
            </button>
            <button className="flex-1 py-3 px-4 rounded-xl font-medium text-sm bg-accent text-accent-foreground shadow-glow">
              📋 チャレンジ
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container-mobile py-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderScene()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Join Onboarding */}
      <JoinOnboarding
        challenge={selectedChallenge || MOCK_CHALLENGES[0]}
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onComplete={handleJoin}
        isFirstChallenge={true}
      />

      {/* Re-show Onboarding (view-only mode) */}
      <OnboardingView
        challenge={selectedChallenge || MOCK_CHALLENGES[0]}
        isOpen={showOnboardingAgain}
        onClose={() => setShowOnboardingAgain(false)}
      />

      {/* Goal Editor */}
      <GoalEditor
        currentGoal={MOCK_MY_PARTICIPATION_WAITING.goal}
        isOpen={showGoalEditor}
        onClose={() => setShowGoalEditor(false)}
        onSave={handleGoalSave}
      />

      {/* Demo Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Ready for review? Contact PO for approval.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Request Changes
            </Button>
            <Button variant="accent" size="sm">
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
