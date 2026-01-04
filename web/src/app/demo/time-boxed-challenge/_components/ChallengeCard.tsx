'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Challenge, CHALLENGE_CONFIG, formatDateRange, User } from '../_data/mock'

interface ChallengeCardProps {
  challenge: Challenge
  participants: User[]
  onJoin: () => void
  isJoined?: boolean
}

export function ChallengeCard({
  challenge,
  participants,
  onJoin,
  isJoined,
}: ChallengeCardProps) {
  const config = CHALLENGE_CONFIG[challenge.type]
  const displayParticipants = participants.slice(0, 5)
  const remainingCount = challenge.participantCount - displayParticipants.length

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-5 cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <h3 className="font-display text-lg tracking-wide">{config.label}</h3>
          </div>
          {isJoined && (
            <Badge variant="success" size="sm">参加中</Badge>
          )}
        </div>

        <p className="text-body-sm text-muted-foreground mb-4">
          {formatDateRange(challenge.startDate, challenge.endDate)}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {displayParticipants.map((user) => (
                <Avatar
                  key={user.id}
                  fallback={user.name.charAt(0)}
                  size="xs"
                  className="border-2 border-card"
                />
              ))}
              {remainingCount > 0 && (
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground border-2 border-card">
                  +{remainingCount}
                </div>
              )}
            </div>
            <span className="text-body-sm text-muted-foreground">
              {challenge.participantCount}人参加
            </span>
          </div>

          <Button
            variant={isJoined ? 'secondary' : 'accent'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onJoin()
            }}
          >
            {isJoined ? '詳細 →' : '参加する →'}
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
