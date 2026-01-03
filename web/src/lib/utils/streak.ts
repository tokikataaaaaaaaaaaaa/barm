import { Record } from '@/lib/types'

export interface StreakResult {
  currentStreak: number
  bestStreak: number
}

/**
 * Calculate streak information from records.
 *
 * A day is considered "achieved" if record.value >= targetValue.
 * Current streak counts consecutive achieved days up to today.
 * If today is not yet achieved, counts from yesterday backwards.
 *
 * @param records - Array of record entries
 * @param targetValue - The target value to consider a day achieved
 * @param today - Today's date in YYYY-MM-DD format
 * @returns StreakResult with currentStreak and bestStreak
 */
export function calculateStreak(
  records: Record[],
  targetValue: number,
  today: string
): StreakResult {
  if (records.length === 0) {
    return { currentStreak: 0, bestStreak: 0 }
  }

  // Filter valid records and create a map of date -> achieved
  const achievedDates = new Map<string, boolean>()
  for (const record of records) {
    if (!record.date || record.date.trim() === '') continue
    // Only consider records up to today
    if (record.date > today) continue
    achievedDates.set(record.date, record.value >= targetValue)
  }

  // Calculate best streak by iterating through sorted dates
  const sortedDates = Array.from(achievedDates.keys())
    .filter((date) => achievedDates.get(date) === true)
    .sort()

  let bestStreak = 0
  let tempStreak = 0
  let prevDate: Date | null = null

  for (const dateStr of sortedDates) {
    const currentDate = parseDate(dateStr)
    if (!currentDate) continue

    if (prevDate === null) {
      tempStreak = 1
    } else {
      const diffDays = Math.round(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (diffDays === 1) {
        tempStreak++
      } else {
        tempStreak = 1
      }
    }

    if (tempStreak > bestStreak) {
      bestStreak = tempStreak
    }

    prevDate = currentDate
  }

  // Calculate current streak
  const currentStreak = calculateCurrentStreak(achievedDates, today)

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
  }
}

function calculateCurrentStreak(
  achievedDates: Map<string, boolean>,
  today: string
): number {
  // Check if today is achieved
  const todayAchieved = achievedDates.get(today) === true

  // Start from today if achieved, otherwise from yesterday
  let currentDate = parseDate(today)
  if (!currentDate) return 0

  if (!todayAchieved) {
    // Move to yesterday
    currentDate = addDays(currentDate, -1)
    // If yesterday is also not achieved, streak is 0
    if (achievedDates.get(formatDate(currentDate)) !== true) {
      return 0
    }
  }

  let streak = 0
  while (true) {
    const dateStr = formatDate(currentDate)
    if (achievedDates.get(dateStr) !== true) {
      break
    }
    streak++
    currentDate = addDays(currentDate, -1)
  }

  return streak
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return null
  }
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
