'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Record } from '@/lib/types'

interface RecordCalendarProps {
  records: Record[]
  targetValue: number
  unit: string
  onDayClick?: (date: string, record?: Record) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_JP = ['日', '月', '火', '水', '木', '金', '土']

function formatYearMonth(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

function formatDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function RecordCalendar({
  records,
  targetValue,
  unit,
  onDayClick,
}: RecordCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const today = useMemo(() => formatDateString(new Date()), [])

  const recordsByDate = useMemo(() => {
    return new Map(records.map((r) => [r.date, r]))
  }, [records])

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    const startingDayOfWeek = firstDay.getDay()

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)
    const totalDays = lastDay.getDate()

    const days: Array<{ date: Date | null; dateString: string }> = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, dateString: '' })
    }

    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day)
      days.push({ date, dateString: formatDateString(date) })
    }

    return days
  }, [currentMonth])

  const monthlyStats = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`

    let achievedDays = 0
    let totalRecordedDays = 0

    records.forEach((record) => {
      if (record.date.startsWith(monthPrefix)) {
        totalRecordedDays++
        if (record.value >= targetValue) {
          achievedDays++
        }
      }
    })

    return { achievedDays, totalRecordedDays }
  }, [records, targetValue, currentMonth])

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    )
  }

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    )
  }

  const handleDayClick = (dateString: string) => {
    if (!dateString || !onDayClick) return
    // Don't allow clicking on future dates
    if (dateString > today) return
    const record = recordsByDate.get(dateString)
    onDayClick(dateString, record)
  }

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
          {'<'}
        </Button>
        <span className="text-lg font-medium">
          {formatYearMonth(currentMonth)}
        </span>
        <Button variant="ghost" size="sm" onClick={handleNextMonth}>
          {'>'}
        </Button>
      </div>

      {/* Monthly stats */}
      <div className="flex justify-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
        <span>
          達成日数: <span className="font-medium text-green-600">{monthlyStats.achievedDays}日</span>
        </span>
        <span>
          記録日数: {monthlyStats.totalRecordedDays}日
        </span>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS_JP.map((day, index) => (
          <div
            key={day}
            className={cn(
              'py-2 text-center text-xs font-medium',
              index === 0 && 'text-red-500',
              index === 6 && 'text-blue-500'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, dateString }, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const record = recordsByDate.get(dateString)
          const isAchieved = record && record.value >= targetValue
          const hasRecord = !!record
          const isToday = dateString === today
          const isFuture = dateString > today
          const dayOfWeek = date.getDay()

          return (
            <button
              key={dateString}
              onClick={() => handleDayClick(dateString)}
              disabled={isFuture}
              className={cn(
                'relative aspect-square flex flex-col items-center justify-center rounded-lg transition-colors',
                !isFuture && 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                isToday && 'ring-2 ring-zinc-900 dark:ring-zinc-100',
                isFuture && 'opacity-30'
              )}
            >
              <span
                className={cn(
                  'text-sm',
                  dayOfWeek === 0 && 'text-red-500',
                  dayOfWeek === 6 && 'text-blue-500'
                )}
              >
                {date.getDate()}
              </span>

              {/* Achievement indicator */}
              {!isFuture && (
                <span
                  className={cn(
                    'mt-0.5 h-1.5 w-1.5 rounded-full',
                    isAchieved && 'bg-green-500',
                    hasRecord && !isAchieved && 'bg-zinc-300 dark:bg-zinc-600',
                    !hasRecord && 'bg-transparent'
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span>達成</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span>未達成</span>
        </div>
      </div>
    </div>
  )
}
