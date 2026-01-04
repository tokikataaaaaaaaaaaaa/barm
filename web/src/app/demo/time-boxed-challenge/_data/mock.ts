// Mock data for Time-Boxed Challenge Demo

export interface Challenge {
  id: string
  type: '1week' | '2week' | '1month'
  startDate: Date
  endDate: Date
  status: 'upcoming' | 'active' | 'completed'
  participantCount: number
  createdAt: Date
}

export interface Goal {
  name: string
  targetValue: number
  unit: string
  icon: string
}

export interface ChallengeParticipation {
  id: string
  challengeId: string
  teamId?: string
  userId: string
  goal: Goal
  isPaid: boolean
  completionRate: number
  notificationTime: string  // HH:MM形式
  notificationEnabled: boolean
  joinedAt: Date
}

// チーム人数設定
export const MIN_TEAM_SIZE = 5
export const MAX_TEAM_SIZE = 9

// チーム分けロジック（最小5人・最大9人）
export function distributeToTeams(participantCount: number): number[] {
  if (participantCount < MIN_TEAM_SIZE) {
    return [participantCount]  // 最小人数未満は1チーム（開始時に人数不足警告）
  }

  if (participantCount <= MAX_TEAM_SIZE) {
    return [participantCount]  // 1チームで収まる
  }

  // 最適なチーム数を計算（各チームが5-9人になるように）
  const minTeams = Math.ceil(participantCount / MAX_TEAM_SIZE)
  const maxTeams = Math.floor(participantCount / MIN_TEAM_SIZE)

  // minTeamsで均等分配
  const teamCount = minTeams
  const baseSize = Math.floor(participantCount / teamCount)
  const remainder = participantCount % teamCount

  return Array.from({ length: teamCount }, (_, i) =>
    baseSize + (i < remainder ? 1 : 0)
  )
}

// 例:
// 5人 → [5]
// 9人 → [9]
// 10人 → [5, 5]
// 14人 → [7, 7]
// 18人 → [9, 9]
// 19人 → [7, 6, 6]

export interface ChallengeRecord {
  id: string
  participationId: string
  date: string
  value: number
  memo?: string  // 任意のメモ
  createdAt: Date
}

export interface User {
  id: string
  name: string
  avatar?: string
}

export interface ParticipantRecord {
  date: string
  achieved: boolean
  value?: number
  memo?: string
}

export interface ParticipantWithStatus {
  user: User
  goal: Goal
  todayStatus: 'achieved' | 'not_achieved' | 'pending'
  achievementRate: number  // 達成率 (0-100)
  records: ParticipantRecord[]  // 全日程の記録
  isCurrentUser?: boolean
}

// Challenge type config
export const CHALLENGE_CONFIG = {
  '1week': {
    icon: '🏆',
    label: '1週間チャレンジ',
    days: 7,
    price: 100,
  },
  '2week': {
    icon: '🎯',
    label: '2週間チャレンジ',
    days: 14,
    price: 200,
  },
  '1month': {
    icon: '💎',
    label: '1ヶ月チャレンジ',
    days: 30,
    price: 300,
  },
} as const

// Mock challenges
export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'challenge-1week',
    type: '1week',
    startDate: new Date('2026-01-06'),
    endDate: new Date('2026-01-12'),
    status: 'active',
    participantCount: 5,  // 1チーム
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'challenge-2week',
    type: '2week',
    startDate: new Date('2026-01-13'),  // 未来の開始日（待機中）
    endDate: new Date('2026-01-26'),
    status: 'upcoming',
    participantCount: 4,
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'challenge-1month',
    type: '1month',
    startDate: new Date('2026-01-06'),
    endDate: new Date('2026-02-04'),
    status: 'active',
    participantCount: 6,  // 1チーム（満員）
    createdAt: new Date('2026-01-01'),
  },
]

// Mock users
export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Taro' },
  { id: 'user-2', name: 'Jiro' },
  { id: 'user-3', name: 'Saburo' },
  { id: 'user-4', name: 'Shiro' },
  { id: 'user-5', name: 'Goro' },
  { id: 'user-6', name: 'Riku' },
  { id: 'user-7', name: 'Haru' },
  { id: 'user-8', name: 'Yuki' },
  { id: 'user-9', name: 'Kai' },
  { id: 'user-10', name: 'Ren' },
]

// Mock current user
export const MOCK_CURRENT_USER: User = {
  id: 'user-me',
  name: 'You',
}

// Mock participants with status（最大6人）
export const MOCK_PARTICIPANTS: ParticipantWithStatus[] = [
  {
    user: MOCK_USERS[0],
    goal: { name: '腕立て伏せ', targetValue: 50, unit: '回', icon: '💪' },
    todayStatus: 'achieved',
    achievementRate: 100,
    records: [
      { date: '2026-01-06', achieved: true, value: 55, memo: '初日から気合い入れた！' },
      { date: '2026-01-07', achieved: true, value: 50 },
      { date: '2026-01-08', achieved: true, value: 60, memo: '調子良かった' },
      { date: '2026-01-09', achieved: true, value: 50 },
      { date: '2026-01-10', achieved: true, value: 52 },
      { date: '2026-01-11', achieved: true, value: 50, memo: '継続は力なり' },
      { date: '2026-01-12', achieved: true, value: 55, memo: '完走できた！嬉しい' },
    ],
  },
  {
    user: MOCK_USERS[1],
    goal: { name: '読書', targetValue: 30, unit: '分', icon: '📚' },
    todayStatus: 'not_achieved',
    achievementRate: 57,
    records: [
      { date: '2026-01-06', achieved: true, value: 35, memo: '面白い本見つけた' },
      { date: '2026-01-07', achieved: true, value: 30 },
      { date: '2026-01-08', achieved: false, value: 15, memo: '仕事が忙しかった...' },
      { date: '2026-01-09', achieved: true, value: 40 },
      { date: '2026-01-10', achieved: false, value: 0, memo: '完全に忘れてた' },
      { date: '2026-01-11', achieved: true, value: 30, memo: '挽回！' },
      { date: '2026-01-12', achieved: false, value: 20 },
    ],
  },
  {
    user: MOCK_USERS[2],
    goal: { name: 'ランニング', targetValue: 5, unit: 'km', icon: '🏃' },
    todayStatus: 'achieved',
    achievementRate: 86,
    records: [
      { date: '2026-01-06', achieved: true, value: 5 },
      { date: '2026-01-07', achieved: true, value: 6, memo: '朝ランが気持ちよかった' },
      { date: '2026-01-08', achieved: true, value: 5 },
      { date: '2026-01-09', achieved: false, value: 3, memo: '雨で途中で断念' },
      { date: '2026-01-10', achieved: true, value: 5 },
      { date: '2026-01-11', achieved: true, value: 7, memo: '新しいコース発見！' },
      { date: '2026-01-12', achieved: true, value: 5 },
    ],
  },
  {
    user: MOCK_CURRENT_USER,
    goal: { name: '腕立て伏せ', targetValue: 50, unit: '回', icon: '💪' },
    todayStatus: 'not_achieved',
    achievementRate: 29,
    records: [
      { date: '2026-01-06', achieved: true, value: 50, memo: 'やるぞ！' },
      { date: '2026-01-07', achieved: true, value: 55, memo: '意外といける' },
      { date: '2026-01-08', achieved: false, value: 30, memo: '筋肉痛がひどい' },
      { date: '2026-01-09', achieved: false, value: 0 },
      { date: '2026-01-10', achieved: false, value: 20, memo: '少しだけやった' },
      { date: '2026-01-11', achieved: false, value: 0, memo: '明日から本気出す' },
      { date: '2026-01-12', achieved: false, value: 0 },
    ],
    isCurrentUser: true,
  },
  {
    user: MOCK_USERS[3],
    goal: { name: '瞑想', targetValue: 15, unit: '分', icon: '🧘' },
    todayStatus: 'achieved',
    achievementRate: 71,
    records: [
      { date: '2026-01-06', achieved: true, value: 15, memo: '心が落ち着く' },
      { date: '2026-01-07', achieved: false, value: 10 },
      { date: '2026-01-08', achieved: true, value: 20, memo: '集中できた' },
      { date: '2026-01-09', achieved: true, value: 15 },
      { date: '2026-01-10', achieved: true, value: 15 },
      { date: '2026-01-11', achieved: false, value: 5, memo: '眠くて無理だった' },
      { date: '2026-01-12', achieved: true, value: 15 },
    ],
  },
  {
    user: MOCK_USERS[4],
    goal: { name: 'スクワット', targetValue: 100, unit: '回', icon: '🦵' },
    todayStatus: 'pending',
    achievementRate: 43,
    records: [
      { date: '2026-01-06', achieved: true, value: 100, memo: '足がプルプル' },
      { date: '2026-01-07', achieved: false, value: 50 },
      { date: '2026-01-08', achieved: true, value: 100 },
      { date: '2026-01-09', achieved: false, value: 80, memo: 'あと少しだった' },
      { date: '2026-01-10', achieved: false, value: 0 },
      { date: '2026-01-11', achieved: true, value: 120, memo: '自己ベスト！' },
      { date: '2026-01-12', achieved: false, value: 0 },
    ],
  },
]

// Mock participation (current user)
export const MOCK_MY_PARTICIPATION: ChallengeParticipation = {
  id: 'participation-me',
  challengeId: 'challenge-1week',
  userId: 'user-me',
  goal: { name: '腕立て伏せ', targetValue: 50, unit: '回', icon: '💪' },
  isPaid: false,
  completionRate: 28,
  notificationTime: '20:00',
  notificationEnabled: true,
  joinedAt: new Date('2026-01-06'),
}

// Mock participation for waiting screen (upcoming challenge)
export const MOCK_MY_PARTICIPATION_WAITING: ChallengeParticipation = {
  id: 'participation-me-waiting',
  challengeId: 'challenge-2week',
  userId: 'user-me',
  goal: { name: '読書', targetValue: 30, unit: '分', icon: '📚' },
  isPaid: false,
  completionRate: 0,
  notificationTime: '21:00',
  notificationEnabled: true,
  joinedAt: new Date('2026-01-04'),
}

// Mock records (for calendar)
export const MOCK_RECORDS: { date: string; achieved: boolean }[] = [
  { date: '2026-01-06', achieved: true },
  { date: '2026-01-07', achieved: true },
  { date: '2026-01-08', achieved: false },
  { date: '2026-01-09', achieved: false },
  { date: '2026-01-10', achieved: false },
  { date: '2026-01-11', achieved: false },
  { date: '2026-01-12', achieved: false },
]

// Mock result data
export interface ChallengeResultData {
  achievedDays: number
  totalDays: number
  rank: number
  rankings: { user: User; achievedDays: number; totalDays: number }[]
}

export const MOCK_RESULT_COMPLETED: ChallengeResultData = {
  achievedDays: 6,
  totalDays: 7,
  rank: 3,
  rankings: [
    { user: MOCK_USERS[0], achievedDays: 7, totalDays: 7 },
    { user: MOCK_USERS[2], achievedDays: 6, totalDays: 7 },
    { user: MOCK_CURRENT_USER, achievedDays: 6, totalDays: 7 },
    { user: MOCK_USERS[1], achievedDays: 5, totalDays: 7 },
  ],
}

export const MOCK_RESULT_ALMOST: ChallengeResultData = {
  achievedDays: 5,
  totalDays: 7,
  rank: 5,
  rankings: [
    { user: MOCK_USERS[0], achievedDays: 7, totalDays: 7 },
    { user: MOCK_USERS[2], achievedDays: 6, totalDays: 7 },
    { user: MOCK_USERS[1], achievedDays: 5, totalDays: 7 },
    { user: MOCK_USERS[3], achievedDays: 5, totalDays: 7 },
    { user: MOCK_CURRENT_USER, achievedDays: 5, totalDays: 7 },
  ],
}

// Goal categories for onboarding flow
export interface GoalCategory {
  id: string
  icon: string
  label: string
  description: string
  goals: GoalOption[]
}

export interface GoalOption {
  id: string
  name: string
  unit: string
  presets: number[]
  recommended: number
}

export const GOAL_CATEGORIES: GoalCategory[] = [
  {
    id: 'workout',
    icon: '💪',
    label: '筋トレ',
    description: '腕立て・スクワット・プランク',
    goals: [
      { id: 'pushup', name: '腕立て伏せ', unit: '回', presets: [10, 15, 20, 30, 50], recommended: 15 },
      { id: 'squat', name: 'スクワット', unit: '回', presets: [10, 20, 30, 50, 100], recommended: 20 },
      { id: 'plank', name: 'プランク', unit: '秒', presets: [30, 45, 60, 90, 120], recommended: 30 },
      { id: 'pullup', name: '懸垂', unit: '回', presets: [3, 5, 10, 15, 20], recommended: 5 },
      { id: 'situp', name: '腹筋', unit: '回', presets: [10, 20, 30, 50, 100], recommended: 20 },
    ],
  },
  {
    id: 'exercise',
    icon: '🏃',
    label: '運動',
    description: 'ランニング・散歩・ストレッチ',
    goals: [
      { id: 'running', name: 'ランニング', unit: 'km', presets: [1, 2, 3, 5, 10], recommended: 2 },
      { id: 'walking', name: '散歩', unit: '歩', presets: [3000, 5000, 8000, 10000], recommended: 5000 },
      { id: 'stretch', name: 'ストレッチ', unit: '分', presets: [5, 10, 15, 20, 30], recommended: 10 },
    ],
  },
  {
    id: 'study',
    icon: '📚',
    label: '学習',
    description: '読書・英語・資格勉強',
    goals: [
      { id: 'reading', name: '読書', unit: '分', presets: [10, 15, 20, 30, 60], recommended: 15 },
      { id: 'english', name: '英語学習', unit: '分', presets: [10, 15, 20, 30, 60], recommended: 15 },
      { id: 'study', name: '資格勉強', unit: '分', presets: [15, 30, 45, 60, 90], recommended: 30 },
    ],
  },
  {
    id: 'habit',
    icon: '🧘',
    label: '習慣',
    description: '瞑想・早起き・日記',
    goals: [
      { id: 'meditation', name: '瞑想', unit: '分', presets: [5, 10, 15, 20, 30], recommended: 5 },
      { id: 'earlybird', name: '早起き', unit: '時', presets: [5, 6, 7], recommended: 6 },
      { id: 'journal', name: '日記', unit: '行', presets: [3, 5, 10, 15], recommended: 5 },
    ],
  },
  {
    id: 'custom',
    icon: '✏️',
    label: 'その他',
    description: '自分でカスタマイズ',
    goals: [],
  },
]

// Goal icon options (legacy)
export const GOAL_ICONS = [
  { icon: '💪', label: '筋トレ' },
  { icon: '📚', label: '読書' },
  { icon: '🏃', label: 'ランニング' },
  { icon: '🧘', label: '瞑想' },
  { icon: '🦵', label: 'スクワット' },
  { icon: '🌍', label: '英語' },
  { icon: '✍️', label: '勉強' },
  { icon: '🏋️', label: 'ジム' },
]

// Unit options
export const UNIT_OPTIONS = ['回', '分', '秒', 'km', '歩', 'ページ', '問', 'セット', '行', '時']

// Helper functions
export function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  })
  const endStr = end.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  })
  return `${startStr} 〜 ${endStr}`
}

export function getRemainingDays(endDate: Date): number {
  const today = new Date()
  const diff = endDate.getTime() - today.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function getResultType(achievedDays: number, totalDays: number): 'completed' | 'almost' | 'failed' {
  const rate = totalDays > 0 ? (achievedDays / totalDays) * 100 : 0
  if (rate >= 80) return 'completed'
  if (rate >= 50) return 'almost'
  return 'failed'
}
