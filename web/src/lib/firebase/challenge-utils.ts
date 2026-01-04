import { Challenge, CHALLENGE_DURATION } from '@/lib/types'

// Pure utility functions for challenge calculations
// These don't depend on Firebase and can be safely imported in tests

export function getChallengeDays(challenge: Challenge): string[] {
  const days: string[] = []
  const totalDays = CHALLENGE_DURATION[challenge.type]
  const startDate = new Date(challenge.startDate)

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    days.push(date.toISOString().split('T')[0])
  }

  return days
}

export function getRemainingDays(challenge: Challenge): number {
  const now = new Date()
  const endDate = new Date(challenge.endDate)
  const diffTime = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

export function getDaysUntilStart(challenge: Challenge): number {
  const now = new Date()
  const startDate = new Date(challenge.startDate)
  const diffTime = startDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}
