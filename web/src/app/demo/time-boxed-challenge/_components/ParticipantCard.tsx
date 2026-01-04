'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { ParticipantWithStatus } from '../_data/mock'

interface ParticipantCardProps {
  participant: ParticipantWithStatus
  index: number
}

export function ParticipantCard({ participant, index }: ParticipantCardProps) {
  const { user, goal, todayStatus, records, isCurrentUser } = participant
  const [isExpanded, setIsExpanded] = useState(false)

  // Calculate achieved days
  const achievedDays = records.filter((r) => r.achieved).length
  const totalDays = records.length

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Main Card */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-colors ${
          isCurrentUser
            ? 'bg-accent/10 border border-accent/30'
            : todayStatus === 'achieved'
            ? 'bg-success/10'
            : 'bg-secondary/50'
        } ${isExpanded ? 'rounded-b-none' : ''}`}
      >
        <Avatar fallback={user.name.charAt(0)} size="sm" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-body-sm font-medium truncate">
              {user.name}
              {isCurrentUser && (
                <span className="text-accent ml-1">(自分)</span>
              )}
            </p>
            <span className="text-body-sm font-bold text-accent">
              {achievedDays}/{totalDays}日
            </span>
          </div>
          <p className="text-caption text-muted-foreground truncate">
            {goal.icon} {goal.name} {goal.targetValue}{goal.unit}/日
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {todayStatus === 'achieved' ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="text-xl"
            >
              ✅
            </motion.span>
          ) : todayStatus === 'not_achieved' ? (
            <span className="text-xl opacity-50">⬜</span>
          ) : (
            <span className="text-caption text-muted-foreground">-</span>
          )}
          <span className="text-muted-foreground text-sm">
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {/* Expanded Calendar */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`overflow-hidden rounded-b-xl ${
              isCurrentUser
                ? 'bg-accent/5 border border-t-0 border-accent/30'
                : 'bg-secondary/30'
            }`}
          >
            <div className="p-4">
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-caption text-muted-foreground">達成状況</span>
                  <span className="text-body-sm font-bold text-accent">
                    {achievedDays}/{totalDays}日
                  </span>
                </div>
                <Progress value={achievedDays} max={totalDays} />
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                  <div key={day} className="text-caption text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
                {records.map((record) => {
                  const date = new Date(record.date)
                  const dayOfMonth = date.getDate()
                  return (
                    <div
                      key={record.date}
                      className={`aspect-square rounded-md flex flex-col items-center justify-center text-xs ${
                        record.achieved
                          ? 'bg-success/20 text-success'
                          : 'bg-secondary/50 text-muted-foreground'
                      }`}
                      title={`${record.date}: ${record.value ?? 0}${goal.unit}`}
                    >
                      <span className="text-[10px]">{dayOfMonth}</span>
                      <span>{record.achieved ? '✅' : '⬜'}</span>
                    </div>
                  )
                })}
              </div>

              {/* Record details */}
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-caption text-muted-foreground mb-2">記録詳細</p>
                <div className="space-y-1">
                  {records.slice().reverse().slice(0, 3).map((record) => (
                    <div
                      key={record.date}
                      className="flex items-center justify-between text-caption"
                    >
                      <span className="text-muted-foreground">
                        {new Date(record.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                      </span>
                      <span className={record.achieved ? 'text-success' : 'text-muted-foreground'}>
                        {record.value ?? 0}{goal.unit}
                        {record.achieved ? ' ✓' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
