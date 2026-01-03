import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateInviteCode,
  isValidInviteCode,
  createGroup,
  joinGroup,
  leaveGroup,
  deleteGroup,
  getGroup,
  getGroupByInviteCode,
  getGroupMembers,
} from './groups'
import { MAX_GROUP_MEMBERS, INVITE_CODE_LENGTH } from '@/lib/types'

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => ({ seconds: Date.now() / 1000 })),
  Timestamp: {
    now: vi.fn(() => ({
      toDate: () => new Date(),
      seconds: Date.now() / 1000,
    })),
  },
  runTransaction: vi.fn(),
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn(),
  })),
}))

vi.mock('./config', () => ({
  db: {},
}))

describe('Invite Code Generation', () => {
  describe('generateInviteCode', () => {
    it('should generate a 6-character code', () => {
      const code = generateInviteCode()
      expect(code).toHaveLength(INVITE_CODE_LENGTH)
    })

    it('should only contain uppercase alphanumeric characters', () => {
      const code = generateInviteCode()
      expect(code).toMatch(/^[A-Z0-9]{6}$/)
    })

    it('should generate unique codes', () => {
      const codes = new Set<string>()
      for (let i = 0; i < 100; i++) {
        codes.add(generateInviteCode())
      }
      // With 36^6 possible combinations, 100 codes should all be unique
      expect(codes.size).toBe(100)
    })
  })

  describe('isValidInviteCode', () => {
    it('should return true for valid 6-character uppercase alphanumeric code', () => {
      expect(isValidInviteCode('ABC123')).toBe(true)
      expect(isValidInviteCode('ZZZZZ0')).toBe(true)
      expect(isValidInviteCode('000000')).toBe(true)
    })

    it('should return false for lowercase characters', () => {
      expect(isValidInviteCode('abc123')).toBe(false)
      expect(isValidInviteCode('Abc123')).toBe(false)
    })

    it('should return false for wrong length', () => {
      expect(isValidInviteCode('ABC12')).toBe(false)
      expect(isValidInviteCode('ABC1234')).toBe(false)
      expect(isValidInviteCode('')).toBe(false)
    })

    it('should return false for special characters', () => {
      expect(isValidInviteCode('ABC-12')).toBe(false)
      expect(isValidInviteCode('ABC_12')).toBe(false)
      expect(isValidInviteCode('ABC 12')).toBe(false)
    })
  })
})

describe('Group Repository', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('createGroup', () => {
    it('should throw error if user already belongs to a group', async () => {
      const { getDoc } = await import('firebase/firestore')
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ groupId: 'existing-group-id' }),
      } as any)

      await expect(createGroup('user1', 'New Group')).rejects.toThrow(
        'You are already a member of a group'
      )
    })

    it('should throw error if group name is empty', async () => {
      const { getDoc } = await import('firebase/firestore')
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ groupId: null }),
      } as any)

      await expect(createGroup('user1', '')).rejects.toThrow(
        'Group name is required'
      )
    })

    it('should throw error if group name is too long', async () => {
      const { getDoc } = await import('firebase/firestore')
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ groupId: null }),
      } as any)

      const longName = 'a'.repeat(51)
      await expect(createGroup('user1', longName)).rejects.toThrow(
        'Group name must be 50 characters or less'
      )
    })
  })

  describe('joinGroup', () => {
    it('should throw error for invalid invite code format', async () => {
      await expect(joinGroup('user1', 'invalid')).rejects.toThrow(
        'Invalid invite code format'
      )
    })

    it('should throw error if user already belongs to a group', async () => {
      const { getDoc } = await import('firebase/firestore')
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ groupId: 'existing-group-id' }),
      } as any)

      await expect(joinGroup('user1', 'ABC123')).rejects.toThrow(
        'You are already a member of a group'
      )
    })
  })

  describe('leaveGroup', () => {
    beforeEach(() => {
      vi.resetAllMocks()
    })

    it('should throw error if user is not a member of the group', async () => {
      const { getDoc } = await import('firebase/firestore')
      const mockDate = new Date('2024-01-01')
      vi.mocked(getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ groupId: 'different-group' }),
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          id: 'group1',
          data: () => ({
            ownerId: 'other-user',
            memberCount: 2,
            name: 'Test',
            inviteCode: 'ABC123',
            createdAt: { toDate: () => mockDate },
          }),
        } as any)

      await expect(leaveGroup('user1', 'group1')).rejects.toThrow(
        'You are not a member of this group'
      )
    })

    it('should throw error if owner tries to leave with other members', async () => {
      const { getDoc } = await import('firebase/firestore')
      const mockDate = new Date('2024-01-01')
      // First call: getUserGroupId returns user with groupId matching the target
      // Second call: getGroup returns the group with owner = user1 and memberCount > 1
      vi.mocked(getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ groupId: 'group1' }),
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          id: 'group1',
          data: () => ({
            ownerId: 'user1',
            memberCount: 3,
            name: 'Test',
            inviteCode: 'ABC123',
            createdAt: { toDate: () => mockDate },
          }),
        } as any)

      await expect(leaveGroup('user1', 'group1')).rejects.toThrow(
        'Owner cannot leave the group while other members exist'
      )
    })
  })

  describe('deleteGroup', () => {
    it('should throw error if user is not the owner', async () => {
      const { getDoc, doc } = await import('firebase/firestore')
      const mockDate = new Date('2024-01-01')
      // Mock doc to return something
      vi.mocked(doc).mockReturnValue({ id: 'group1' } as any)
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'group1',
        data: () => ({
          ownerId: 'other-user',
          memberCount: 1,
          name: 'Test',
          inviteCode: 'ABC123',
          createdAt: { toDate: () => mockDate },
        }),
      } as any)

      await expect(deleteGroup('user1', 'group1')).rejects.toThrow(
        'Only the owner can delete the group'
      )
    })

    it('should throw error if group has other members', async () => {
      const { getDoc, doc } = await import('firebase/firestore')
      const mockDate = new Date('2024-01-01')
      vi.mocked(doc).mockReturnValue({ id: 'group1' } as any)
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'group1',
        data: () => ({
          ownerId: 'user1',
          memberCount: 3,
          name: 'Test',
          inviteCode: 'ABC123',
          createdAt: { toDate: () => mockDate },
        }),
      } as any)

      await expect(deleteGroup('user1', 'group1')).rejects.toThrow(
        'Cannot delete group with other members'
      )
    })
  })

  describe('Member limits', () => {
    it('should enforce maximum of 5 members per group', async () => {
      const { getDoc, getDocs } = await import('firebase/firestore')
      const mockDate = new Date('2024-01-01')

      // User not in a group
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ groupId: null }),
      } as any)

      // Group found with 5 members
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'group1',
            data: () => ({
              name: 'Test Group',
              inviteCode: 'ABC123',
              ownerId: 'owner',
              memberCount: MAX_GROUP_MEMBERS,
              createdAt: { toDate: () => mockDate },
            }),
          },
        ],
      } as any)

      await expect(joinGroup('user1', 'ABC123')).rejects.toThrow(
        'Group is full'
      )
    })
  })
})

describe('getGroup', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return null if group does not exist', async () => {
    const { getDoc } = await import('firebase/firestore')
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
    } as any)

    const result = await getGroup('nonexistent')
    expect(result).toBeNull()
  })

  it('should return group if it exists', async () => {
    const { getDoc, Timestamp } = await import('firebase/firestore')
    const mockDate = new Date('2024-01-01')
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      id: 'group1',
      data: () => ({
        name: 'Test Group',
        inviteCode: 'ABC123',
        ownerId: 'user1',
        memberCount: 2,
        createdAt: { toDate: () => mockDate },
      }),
    } as any)

    const result = await getGroup('group1')
    expect(result).toEqual({
      id: 'group1',
      name: 'Test Group',
      inviteCode: 'ABC123',
      ownerId: 'user1',
      memberCount: 2,
      createdAt: mockDate,
    })
  })
})

describe('getGroupByInviteCode', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return null if no group with code exists', async () => {
    const { getDocs } = await import('firebase/firestore')
    vi.mocked(getDocs).mockResolvedValue({
      empty: true,
      docs: [],
    } as any)

    const result = await getGroupByInviteCode('ABC123')
    expect(result).toBeNull()
  })

  it('should return group if found', async () => {
    const { getDocs } = await import('firebase/firestore')
    const mockDate = new Date('2024-01-01')
    vi.mocked(getDocs).mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'group1',
          data: () => ({
            name: 'Test Group',
            inviteCode: 'ABC123',
            ownerId: 'user1',
            memberCount: 2,
            createdAt: { toDate: () => mockDate },
          }),
        },
      ],
    } as any)

    const result = await getGroupByInviteCode('ABC123')
    expect(result).toEqual({
      id: 'group1',
      name: 'Test Group',
      inviteCode: 'ABC123',
      ownerId: 'user1',
      memberCount: 2,
      createdAt: mockDate,
    })
  })
})

describe('getGroupMembers', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return empty array if no members', async () => {
    const { getDocs } = await import('firebase/firestore')
    vi.mocked(getDocs).mockResolvedValue({
      empty: true,
      docs: [],
    } as any)

    const result = await getGroupMembers('group1')
    expect(result).toEqual([])
  })

  it('should return list of members', async () => {
    const { getDocs } = await import('firebase/firestore')
    const mockDate1 = new Date('2024-01-01')
    const mockDate2 = new Date('2024-01-02')
    vi.mocked(getDocs).mockResolvedValue({
      empty: false,
      docs: [
        {
          data: () => ({
            userId: 'user1',
            displayName: 'User One',
            joinedAt: { toDate: () => mockDate1 },
          }),
        },
        {
          data: () => ({
            userId: 'user2',
            displayName: 'User Two',
            joinedAt: { toDate: () => mockDate2 },
          }),
        },
      ],
    } as any)

    const result = await getGroupMembers('group1')
    expect(result).toEqual([
      { userId: 'user1', displayName: 'User One', joinedAt: mockDate1 },
      { userId: 'user2', displayName: 'User Two', joinedAt: mockDate2 },
    ])
  })
})
