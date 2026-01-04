import { describe, it, expect } from 'vitest'
import { getChallengeDays, getRemainingDays, getDaysUntilStart } from './challenge-utils'
import { Challenge } from '@/lib/types'

// Helper to create a mock challenge
function createMockChallenge(overrides: Partial<Challenge> = {}): Challenge {
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() + 1) // Tomorrow
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6) // 7 days later

  return {
    id: 'test-challenge-1',
    type: '1week',
    startDate,
    endDate,
    status: 'upcoming',
    participantCount: 10,
    createdAt: new Date(),
    ...overrides,
  }
}

describe('getChallengeDays', () => {
  it('returns correct number of days for 1 week challenge', () => {
    const challenge = createMockChallenge({ type: '1week' })
    const days = getChallengeDays(challenge)
    expect(days.length).toBe(7)
  })

  it('returns correct number of days for 2 week challenge', () => {
    const startDate = new Date('2026-01-06')
    const endDate = new Date('2026-01-19')
    const challenge = createMockChallenge({
      type: '2week',
      startDate,
      endDate,
    })
    const days = getChallengeDays(challenge)
    expect(days.length).toBe(14)
  })

  it('returns correct number of days for 1 month challenge', () => {
    const startDate = new Date('2026-01-06')
    const endDate = new Date('2026-02-04')
    const challenge = createMockChallenge({
      type: '1month',
      startDate,
      endDate,
    })
    const days = getChallengeDays(challenge)
    expect(days.length).toBe(30)
  })

  it('returns dates in YYYY-MM-DD format', () => {
    const startDate = new Date('2026-01-06')
    const endDate = new Date('2026-01-12')
    const challenge = createMockChallenge({
      type: '1week',
      startDate,
      endDate,
    })
    const days = getChallengeDays(challenge)
    expect(days[0]).toBe('2026-01-06')
    expect(days[6]).toBe('2026-01-12')
  })
})

describe('getRemainingDays', () => {
  it('returns correct remaining days for active challenge', () => {
    const now = new Date()
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() + 5)
    const challenge = createMockChallenge({
      status: 'active',
      endDate,
    })
    const remaining = getRemainingDays(challenge)
    expect(remaining).toBe(5)
  })

  it('returns 0 for completed challenge', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)
    const challenge = createMockChallenge({
      status: 'completed',
      endDate: pastDate,
    })
    const remaining = getRemainingDays(challenge)
    expect(remaining).toBe(0)
  })
})

describe('getDaysUntilStart', () => {
  it('returns correct days until start for upcoming challenge', () => {
    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() + 3)
    const challenge = createMockChallenge({
      status: 'upcoming',
      startDate,
    })
    const daysUntil = getDaysUntilStart(challenge)
    expect(daysUntil).toBe(3)
  })

  it('returns 0 for already started challenge', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)
    const challenge = createMockChallenge({
      status: 'active',
      startDate: pastDate,
    })
    const daysUntil = getDaysUntilStart(challenge)
    expect(daysUntil).toBe(0)
  })
})
