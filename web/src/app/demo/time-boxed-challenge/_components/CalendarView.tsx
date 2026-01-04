'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { ParticipantWithStatus, ParticipantRecord } from '../_data/mock'

interface CalendarViewProps {
  participants: ParticipantWithStatus[]
  challengeDays: string[] // Array of date strings like '2026-01-06'
}

interface DayData {
  date: string
  dayOfWeek: string
  dayOfMonth: number
  myRecord: ParticipantRecord | null
  othersRecords: {
    participant: ParticipantWithStatus
    record: ParticipantRecord
  }[]
}

export function CalendarView({ participants, challengeDays }: CalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  // Find current user
  const currentUser = participants.find((p) => p.isCurrentUser)
  const others = participants.filter((p) => !p.isCurrentUser)

  // Calculate my achievement stats
  const myAchievedDays = currentUser?.records.filter((r) => r.achieved).length ?? 0
  const totalDays = challengeDays.length

  // Build day data from participants
  const dayDataMap: Map<string, DayData> = new Map()

  challengeDays.forEach((dateStr) => {
    const date = new Date(dateStr)
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
    const dayOfMonth = date.getDate()

    const myRecord = currentUser?.records.find((r) => r.date === dateStr) ?? null

    const othersRecords: DayData['othersRecords'] = []
    others.forEach((participant) => {
      const record = participant.records.find((r) => r.date === dateStr)
      if (record) {
        othersRecords.push({ participant, record })
      }
    })

    dayDataMap.set(dateStr, {
      date: dateStr,
      dayOfWeek,
      dayOfMonth,
      myRecord,
      othersRecords,
    })
  })

  const dayDataArray = Array.from(dayDataMap.values())
  const selectedDayData = selectedDay ? dayDataMap.get(selectedDay) : null

  return (
    <div className="space-y-4">
      {/* My Records - Always visible */}
      {currentUser && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentUser.goal.icon}</span>
              <div>
                <h3 className="text-body font-medium">自分の記録</h3>
                <p className="text-caption text-muted-foreground">
                  {currentUser.goal.name} {currentUser.goal.targetValue}{currentUser.goal.unit}/日
                </p>
              </div>
            </div>
            <span className="text-body font-bold text-accent">
              {myAchievedDays}/{totalDays}日
            </span>
          </div>

          {/* My week calendar */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day} className="text-caption text-muted-foreground font-medium">
                {day}
              </div>
            ))}
            {dayDataArray.map((dayData) => (
              <div
                key={dayData.date}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center ${
                  dayData.myRecord?.achieved
                    ? 'bg-success/20'
                    : 'bg-secondary/50'
                }`}
              >
                <span className="text-xs font-medium">{dayData.dayOfMonth}</span>
                <span className="text-lg">
                  {dayData.myRecord?.achieved ? '✅' : '⬜'}
                </span>
              </div>
            ))}
          </div>

          {/* My memos */}
          {currentUser.records.some((r) => r.memo) && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-caption text-muted-foreground mb-2">自分のメモ</p>
              <div className="space-y-2">
                {currentUser.records
                  .filter((r) => r.memo)
                  .slice()
                  .reverse()
                  .slice(0, 3)
                  .map((record) => (
                    <div key={record.date} className="flex items-start gap-2 text-caption">
                      <span className="text-muted-foreground shrink-0">
                        {new Date(record.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                      </span>
                      <span className="italic">"{record.memo}"</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Others' Records */}
      <Card className="p-5">
        <h3 className="font-display text-lg tracking-wide mb-4">👥 みんなの記録</h3>

        {/* Calendar Grid - Color based on MY achievement */}
        <div className="grid grid-cols-7 gap-2 text-center mb-4">
          {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
            <div key={day} className="text-caption text-muted-foreground font-medium">
              {day}
            </div>
          ))}
          {dayDataArray.map((dayData) => {
            const isSelected = selectedDay === dayData.date
            const myAchieved = dayData.myRecord?.achieved ?? false

            return (
              <button
                key={dayData.date}
                onClick={() => setSelectedDay(isSelected ? null : dayData.date)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-accent text-accent-foreground ring-2 ring-accent ring-offset-2'
                    : myAchieved
                    ? 'bg-success/20 hover:bg-success/30'
                    : 'bg-secondary/50 hover:bg-secondary/80'
                }`}
              >
                <span className="text-xs font-medium">{dayData.dayOfMonth}</span>
                <span className="text-lg">
                  {myAchieved ? '✅' : '⬜'}
                </span>
              </button>
            )
          })}
        </div>

        {/* Selected Day Details - Others only */}
        <AnimatePresence>
          {selectedDayData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-body font-medium">
                    {new Date(selectedDayData.date).toLocaleDateString('ja-JP', {
                      month: 'numeric',
                      day: 'numeric',
                      weekday: 'short',
                    })}
                  </h4>
                  <span className="text-body-sm text-muted-foreground">
                    {selectedDayData.othersRecords.filter((r) => r.record.achieved).length}/{selectedDayData.othersRecords.length}人達成
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedDayData.othersRecords.map(({ participant, record }) => (
                    <motion.div
                      key={participant.user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-xl ${
                        record.achieved
                          ? 'bg-success/10'
                          : 'bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar fallback={participant.user.name.charAt(0)} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-body-sm font-medium">
                                {participant.user.name}
                              </span>
                              <span className="text-lg">
                                {record.achieved ? '✅' : '⬜'}
                              </span>
                            </div>
                            <span
                              className={`text-body-sm ${
                                record.achieved ? 'text-success' : 'text-muted-foreground'
                              }`}
                            >
                              {record.value ?? 0}{participant.goal.unit}
                            </span>
                          </div>
                          <p className="text-caption text-muted-foreground">
                            {participant.goal.icon} {participant.goal.name} ({participant.goal.targetValue}{participant.goal.unit}/日)
                          </p>
                          {record.memo && (
                            <p className="text-caption text-foreground mt-2 bg-background/50 rounded-lg px-3 py-2 italic">
                              "{record.memo}"
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint when nothing selected */}
        {!selectedDay && (
          <p className="text-center text-caption text-muted-foreground">
            日付をタップしてメンバーの記録を見る
          </p>
        )}
      </Card>
    </div>
  )
}
