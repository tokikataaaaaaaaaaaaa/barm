import { describe, it, expect } from 'vitest'
import {
  distributeToTeams,
  getResultType,
  MIN_TEAM_SIZE,
  MAX_TEAM_SIZE,
  COMPLETION_THRESHOLD,
  ALMOST_THRESHOLD,
} from './challenge'

describe('distributeToTeams', () => {
  it('returns single team for less than MIN_TEAM_SIZE participants', () => {
    expect(distributeToTeams(3)).toEqual([3])
    expect(distributeToTeams(4)).toEqual([4])
  })

  it('returns single team for MIN_TEAM_SIZE to MAX_TEAM_SIZE participants', () => {
    expect(distributeToTeams(5)).toEqual([5])
    expect(distributeToTeams(7)).toEqual([7])
    expect(distributeToTeams(9)).toEqual([9])
  })

  it('distributes 10 participants into 2 teams of 5', () => {
    const result = distributeToTeams(10)
    expect(result).toEqual([5, 5])
    expect(result.reduce((a, b) => a + b, 0)).toBe(10)
  })

  it('distributes 14 participants into 2 teams of 7', () => {
    const result = distributeToTeams(14)
    expect(result).toEqual([7, 7])
  })

  it('distributes 18 participants into 2 teams of 9', () => {
    const result = distributeToTeams(18)
    expect(result).toEqual([9, 9])
  })

  it('distributes 19 participants into 3 teams', () => {
    const result = distributeToTeams(19)
    expect(result.length).toBe(3)
    expect(result.reduce((a, b) => a + b, 0)).toBe(19)
    // All teams should be between MIN and MAX size
    result.forEach((size) => {
      expect(size).toBeGreaterThanOrEqual(MIN_TEAM_SIZE)
      expect(size).toBeLessThanOrEqual(MAX_TEAM_SIZE)
    })
  })

  it('handles large numbers correctly', () => {
    const result = distributeToTeams(100)
    expect(result.reduce((a, b) => a + b, 0)).toBe(100)
    result.forEach((size) => {
      expect(size).toBeGreaterThanOrEqual(MIN_TEAM_SIZE)
      expect(size).toBeLessThanOrEqual(MAX_TEAM_SIZE)
    })
  })
})

describe('getResultType', () => {
  it('returns "completed" for 80% or more achievement', () => {
    expect(getResultType(7, 7)).toBe('completed') // 100%
    expect(getResultType(6, 7)).toBe('completed') // 85.7%
    expect(getResultType(8, 10)).toBe('completed') // 80%
  })

  it('returns "almost" for 50-79% achievement', () => {
    expect(getResultType(5, 7)).toBe('almost') // 71.4%
    expect(getResultType(4, 7)).toBe('almost') // 57.1%
    expect(getResultType(5, 10)).toBe('almost') // 50%
  })

  it('returns "failed" for less than 50% achievement', () => {
    expect(getResultType(3, 7)).toBe('failed') // 42.8%
    expect(getResultType(1, 7)).toBe('failed') // 14.3%
    expect(getResultType(0, 7)).toBe('failed') // 0%
  })

  it('returns "failed" for zero total days', () => {
    expect(getResultType(0, 0)).toBe('failed')
  })
})

describe('constants', () => {
  it('has correct team size constraints', () => {
    expect(MIN_TEAM_SIZE).toBe(5)
    expect(MAX_TEAM_SIZE).toBe(9)
  })

  it('has correct threshold values', () => {
    expect(COMPLETION_THRESHOLD).toBe(0.8)
    expect(ALMOST_THRESHOLD).toBe(0.5)
  })
})
