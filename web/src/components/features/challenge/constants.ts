import { ChallengeType, GoalCategory } from '@/lib/types'

// Challenge type configuration
export const CHALLENGE_CONFIG: Record<
  ChallengeType,
  { icon: string; label: string; price: number }
> = {
  '1week': { icon: '🏆', label: '1週間チャレンジ', price: 100 },
  '2week': { icon: '🎯', label: '2週間チャレンジ', price: 200 },
  '1month': { icon: '💎', label: '1ヶ月チャレンジ', price: 300 },
}

// Goal category configuration
export const GOAL_CATEGORIES: Record<
  GoalCategory,
  {
    icon: string
    label: string
    description: string
    presets: { name: string; icon: string }[]
  }
> = {
  workout: {
    icon: '💪',
    label: '筋トレ',
    description: '腕立て・スクワット・プランク',
    presets: [
      { name: '腕立て伏せ', icon: '💪' },
      { name: 'スクワット', icon: '🦵' },
      { name: 'プランク', icon: '🏋️' },
      { name: '懸垂', icon: '💪' },
      { name: '腹筋', icon: '🏋️' },
    ],
  },
  exercise: {
    icon: '🏃',
    label: '運動',
    description: 'ランニング・散歩・ストレッチ',
    presets: [
      { name: 'ランニング', icon: '🏃' },
      { name: '散歩', icon: '🚶' },
      { name: 'ストレッチ', icon: '🧘' },
      { name: 'サイクリング', icon: '🚴' },
    ],
  },
  study: {
    icon: '📚',
    label: '学習',
    description: '読書・英語・資格勉強',
    presets: [
      { name: '読書', icon: '📚' },
      { name: '英語学習', icon: '🇬🇧' },
      { name: '資格勉強', icon: '📝' },
      { name: 'プログラミング', icon: '💻' },
    ],
  },
  habit: {
    icon: '🧘',
    label: '習慣',
    description: '瞑想・早起き・日記',
    presets: [
      { name: '瞑想', icon: '🧘' },
      { name: '早起き', icon: '⏰' },
      { name: '日記', icon: '📔' },
      { name: '水を飲む', icon: '💧' },
    ],
  },
  other: {
    icon: '✏️',
    label: 'その他',
    description: '自分でカスタマイズ',
    presets: [],
  },
}

// Target value presets
export const TARGET_VALUE_PRESETS: Record<string, { values: number[]; unit: string; recommended: number }> = {
  腕立て伏せ: { values: [10, 15, 20, 30, 50], unit: '回', recommended: 15 },
  スクワット: { values: [10, 20, 30, 50], unit: '回', recommended: 20 },
  プランク: { values: [30, 60, 90, 120], unit: '秒', recommended: 60 },
  懸垂: { values: [3, 5, 10, 15], unit: '回', recommended: 5 },
  腹筋: { values: [10, 20, 30, 50], unit: '回', recommended: 20 },
  ランニング: { values: [1, 2, 3, 5], unit: 'km', recommended: 2 },
  散歩: { values: [1000, 3000, 5000, 10000], unit: '歩', recommended: 3000 },
  ストレッチ: { values: [5, 10, 15, 20], unit: '分', recommended: 10 },
  サイクリング: { values: [5, 10, 15, 20], unit: 'km', recommended: 10 },
  読書: { values: [10, 15, 20, 30], unit: '分', recommended: 15 },
  英語学習: { values: [10, 15, 20, 30], unit: '分', recommended: 15 },
  資格勉強: { values: [30, 60, 90, 120], unit: '分', recommended: 60 },
  プログラミング: { values: [30, 60, 90, 120], unit: '分', recommended: 60 },
  瞑想: { values: [5, 10, 15, 20], unit: '分', recommended: 10 },
  早起き: { values: [5, 6, 7], unit: '時', recommended: 6 },
  日記: { values: [1], unit: '回', recommended: 1 },
  水を飲む: { values: [1, 1.5, 2, 2.5], unit: 'L', recommended: 1.5 },
}

// Notification time options (6:00 - 23:00)
export const NOTIFICATION_TIME_OPTIONS = Array.from({ length: 18 }, (_, i) => {
  const hour = i + 6
  return {
    value: `${hour.toString().padStart(2, '0')}:00`,
    label: `${hour}:00`,
  }
})

// Format helpers
export function formatDateRange(startDate: Date, endDate: Date): string {
  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
    return `${month}/${day} (${dayOfWeek})`
  }
  return `${formatDate(startDate)} 〜 ${formatDate(endDate)}`
}

export function formatShortDate(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}
