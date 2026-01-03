import { describe, it, expect } from 'vitest'
import { calculateStreak, StreakResult } from './streak'
import { Record } from '@/lib/types'

function createRecord(
  date: string,
  value: number,
  missionId = 'mission-1'
): Record {
  return {
    id: `${missionId}_${date}`,
    userId: 'user-1',
    missionId,
    value,
    date,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

describe('calculateStreak', () => {
  describe('current streak', () => {
    it('returns 0 when there are no records', () => {
      const result = calculateStreak([], 10, '2026-01-03')
      expect(result.currentStreak).toBe(0)
      expect(result.bestStreak).toBe(0)
    })

    it('returns 1 when only today has an achieved record', () => {
      const records = [createRecord('2026-01-03', 10)]
      const result = calculateStreak(records, 10, '2026-01-03')
      expect(result.currentStreak).toBe(1)
    })

    it('returns streak count for consecutive days ending today', () => {
      const records = [
        createRecord('2026-01-01', 10),
        createRecord('2026-01-02', 15),
        createRecord('2026-01-03', 10),
      ]
      const result = calculateStreak(records, 10, '2026-01-03')
      expect(result.currentStreak).toBe(3)
    })

    it('returns streak count for consecutive days ending yesterday (if today not yet achieved)', () => {
      const records = [
        createRecord('2026-01-01', 10),
        createRecord('2026-01-02', 15),
      ]
      const result = calculateStreak(records, 10, '2026-01-03')
      expect(result.currentStreak).toBe(2)
    })

    it('returns 0 when yesterday was not achieved and today not yet achieved', () => {
      const records = [
        createRecord('2026-01-01', 10),
        // Missing 2026-01-02
      ]
      const result = calculateStreak(records, 10, '2026-01-03')
      expect(result.currentStreak).toBe(0)
    })

    it('breaks streak when a day is missed', () => {
      const records = [
        createRecord('2026-01-01', 10),
        // Missing 2026-01-02
        createRecord('2026-01-03', 10),
      ]
      const result = calculateStreak(records, 10, '2026-01-03')
      expect(result.currentStreak).toBe(1)
    })

    it('breaks streak when target not met', () => {
      const records = [
        createRecord('2026-01-01', 10),
        createRecord('2026-01-02', 5), // below target
        createRecord('2026-01-03', 10),
      ]
      const result = calculateStreak(records, 10, '2026-01-03')
      expect(result.currentStreak).toBe(1)
    })

    it('counts days where value equals target', () => {
      const records = [
        createRecord('2026-01-02', 10),
        createRecord('2026-01-03', 10),
      ]
      const result = calculateStreak(records, 10, '2026-01-03')
      expect(result.currentStreak).toBe(2)
    })

    it('counts days where value exceeds target', () => {
      const records = [
        createRecord('2026-01-02', 20),
        createRecord('2026-01-03', 15),
      ]
      const result = calculateStreak(records, 10, '2026-01-03')
      expect(result.currentStreak).toBe(2)
    })
  })

  describe('best streak', () => {
    it('returns best streak when it is the same as current streak', () => {
      const records = [
        createRecord('2026-01-02', 10),
        createRecord('2026-01-03', 10),
      ]
      const result = calculateStreak(records, 10, '2026-01-03')
      expect(result.bestStreak).toBe(2)
    })

    it('returns best streak from the past', () => {
      const records = [
        createRecord('2025-12-28', 10),
        createRecord('2025-12-29', 10),
        createRecord('2025-12-30', 10),
        createRecord('2025-12-31', 10),
        // Gap on 2026-01-01
        createRecord('2026-01-02', 10),
        createRecord('2026-01-03', 10),
      ]
      const result = calculateStreak(records, 10, '2026-01-03')
      expect(result.currentStreak).toBe(2)
      expect(result.bestStreak).toBe(4)
    })

    it('handles multiple streak periods correctly', () => {
      const records = [
        createRecord('2025-12-20', 10),
        createRecord('2025-12-21', 10),
        // gap
        createRecord('2025-12-25', 10),
        createRecord('2025-12-26', 10),
        createRecord('2025-12-27', 10),
        // gap
        createRecord('2026-01-03', 10),
      ]
      const result = calculateStreak(records, 10, '2026-01-03')
      expect(result.currentStreak).toBe(1)
      expect(result.bestStreak).toBe(3)
    })

    it('returns 0 for best streak when no records meet target', () => {
      const records = [
        createRecord('2026-01-02', 5),
        createRecord('2026-01-03', 3),
      ]
      const result = calculateStreak(records, 10, '2026-01-03')
      expect(result.bestStreak).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('handles unsorted records', () => {
      const records = [
        createRecord('2026-01-03', 10),
        createRecord('2026-01-01', 10),
        createRecord('2026-01-02', 10),
      ]
      const result = calculateStreak(records, 10, '2026-01-03')
      expect(result.currentStreak).toBe(3)
      expect(result.bestStreak).toBe(3)
    })

    it('handles future dates gracefully (ignores them)', () => {
      const records = [
        createRecord('2026-01-02', 10),
        createRecord('2026-01-03', 10),
        createRecord('2026-01-05', 10), // Future date
      ]
      const result = calculateStreak(records, 10, '2026-01-03')
      expect(result.currentStreak).toBe(2)
    })

    it('handles single day streak', () => {
      const records = [createRecord('2026-01-03', 10)]
      const result = calculateStreak(records, 10, '2026-01-03')
      expect(result.currentStreak).toBe(1)
      expect(result.bestStreak).toBe(1)
    })

    it('handles long streak correctly', () => {
      const records: Record[] = []
      for (let i = 1; i <= 30; i++) {
        const day = String(i).padStart(2, '0')
        records.push(createRecord(`2025-12-${day}`, 10))
      }
      records.push(createRecord('2025-12-31', 10))
      // Add records for Jan 1-3 2026
      records.push(createRecord('2026-01-01', 10))
      records.push(createRecord('2026-01-02', 10))
      records.push(createRecord('2026-01-03', 10))

      const result = calculateStreak(records, 10, '2026-01-03')
      // Dec has 31 days + Jan 3 = 34 days
      expect(result.currentStreak).toBe(34)
      expect(result.bestStreak).toBe(34)
    })

    it('handles targetValue of 0', () => {
      const records = [
        createRecord('2026-01-02', 0),
        createRecord('2026-01-03', 0),
      ]
      const result = calculateStreak(records, 0, '2026-01-03')
      expect(result.currentStreak).toBe(2)
    })

    it('handles empty string date in record by skipping it', () => {
      const records = [
        createRecord('2026-01-02', 10),
        createRecord('', 10), // Invalid date
        createRecord('2026-01-03', 10),
      ]
      const result = calculateStreak(records, 10, '2026-01-03')
      expect(result.currentStreak).toBe(2)
    })
  })
})
