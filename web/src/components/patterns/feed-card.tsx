'use client'

import { motion } from 'framer-motion'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface FeedCardProps {
  user: {
    name: string
    avatar?: string
  }
  mission: {
    name: string
    value: number
    unit: string
    icon?: string
  }
  timeAgo: string
  isNew?: boolean
  index?: number
}

export function FeedCard({ user, mission, timeAgo, isNew, index = 0 }: FeedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(
        'group relative overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-card via-card to-secondary-800/50',
        'border border-border/50 hover:border-accent/30',
        'p-4 transition-all duration-300',
        'hover:shadow-glow hover:-translate-y-0.5',
        isNew && 'ring-2 ring-accent/50 ring-offset-2 ring-offset-background'
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Achievement burst effect for new items */}
      {isNew && (
        <motion.div
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-accent/30"
        />
      )}

      <div className="relative flex items-start gap-3">
        {/* Avatar with glow effect */}
        <div className="relative">
          <Avatar
            fallback={user.name}
            src={user.avatar}
            size="md"
            className="ring-2 ring-border group-hover:ring-accent/50 transition-all duration-300"
          />
          {isNew && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* User name */}
          <p className="font-medium text-foreground truncate">
            {user.name}
          </p>

          {/* Achievement */}
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl">{mission.icon || '💪'}</span>
            <div>
              <p className="text-body-sm text-muted-foreground">
                <span className="font-display text-lg text-accent tracking-wide">
                  {mission.name}
                </span>
              </p>
              <p className="text-heading-sm font-bold text-foreground">
                {mission.value}
                <span className="text-body-sm font-normal text-muted-foreground ml-1">
                  {mission.unit}
                </span>
                <span className="ml-2 text-success">達成!</span>
              </p>
            </div>
          </div>
        </div>

        {/* Time badge */}
        <Badge variant="secondary" size="sm" className="shrink-0">
          {timeAgo}
        </Badge>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  )
}

// Live indicator component
export function LiveIndicator() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
      </span>
      <span className="font-display text-sm tracking-wider text-accent uppercase">
        Live
      </span>
    </div>
  )
}
