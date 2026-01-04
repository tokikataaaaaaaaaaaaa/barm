'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/hooks/use-auth'
import { useChallenges, useMyParticipations } from '@/lib/hooks/use-challenges'
import { ChallengeCard } from '@/components/features/challenge'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { EmptyState } from '@/components/shared/empty-state'
import { Avatar } from '@/components/ui/avatar'

export default function ChallengesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: challenges, isLoading: isChallengesLoading } = useChallenges()
  const { data: myParticipations } = useMyParticipations()

  const participatingChallengeIds = new Set(myParticipations?.map((p) => p.challengeId) || [])

  const handleJoinOrView = (challengeId: string, isJoined: boolean) => {
    if (isJoined) {
      router.push(`/challenges/${challengeId}`)
    } else {
      router.push(`/challenges/${challengeId}/join`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container-mobile">
          <div className="flex h-14 items-center justify-between">
            <h1 className="font-display text-2xl tracking-wide">CHALLENGES</h1>
            <Avatar fallback={user?.displayName || 'G'} size="sm" />
          </div>
        </div>
      </header>

      <main className="container-mobile pb-24 py-6">
        {isChallengesLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : challenges && challenges.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {challenges.map((challenge, index) => {
              const isJoined = participatingChallengeIds.has(challenge.id)
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ChallengeCard
                    challenge={challenge}
                    isJoined={isJoined}
                    onJoin={() => handleJoinOrView(challenge.id, isJoined)}
                  />
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <EmptyState
            icon="🏆"
            title="チャレンジ準備中"
            description="新しいチャレンジがまもなく始まります"
          />
        )}
      </main>
    </div>
  )
}
