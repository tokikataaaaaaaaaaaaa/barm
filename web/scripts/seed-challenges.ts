/**
 * Seed script to add 1 year worth of weekly challenges to Firebase
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-challenges.ts
 *
 * Or add to package.json:
 *   "seed:challenges": "tsx scripts/seed-challenges.ts"
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import * as path from 'path'

// Initialize Firebase Admin with service account
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json')

let app
try {
  // Try to use service account file
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const serviceAccount = require(serviceAccountPath) as ServiceAccount
  app = initializeApp({
    credential: cert(serviceAccount),
  })
} catch {
  // Fallback to environment variable
  console.log('Service account file not found, using GOOGLE_APPLICATION_CREDENTIALS')
  app = initializeApp()
}

const db = getFirestore(app)

interface ChallengeData {
  type: '1week' | '2week' | '1month'
  startDate: Timestamp
  endDate: Timestamp
  status: 'upcoming' | 'active' | 'completed'
  participantCount: number
  createdAt: Timestamp
}

function getNextMonday(from: Date): Date {
  const date = new Date(from)
  const day = date.getDay()
  const diff = day === 0 ? 1 : 8 - day // If Sunday, next day. Otherwise, days until next Monday
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function getStatus(startDate: Date, endDate: Date): 'upcoming' | 'active' | 'completed' {
  const now = new Date()
  if (now < startDate) return 'upcoming'
  if (now > endDate) return 'completed'
  return 'active'
}

async function seedChallenges() {
  console.log('Starting to seed challenges...')

  const now = new Date()
  const challengesRef = db.collection('challenges')

  // Check existing challenges
  const existing = await challengesRef.get()
  if (!existing.empty) {
    console.log(`Found ${existing.size} existing challenges.`)
    const answer = process.argv.includes('--force') ? 'y' : 'n'
    if (answer !== 'y' && !process.argv.includes('--force')) {
      console.log('Use --force flag to add more challenges anyway.')
      console.log('Exiting without changes.')
      process.exit(0)
    }
  }

  // Generate 52 weeks of 1-week challenges (1 year)
  const challenges: ChallengeData[] = []

  // Start from the next Monday
  let startDate = getNextMonday(now)

  for (let week = 0; week < 52; week++) {
    const endDate = addDays(startDate, 6) // Sunday (7 days total, Mon-Sun)

    challenges.push({
      type: '1week',
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      status: getStatus(startDate, endDate),
      participantCount: 0,
      createdAt: Timestamp.now(),
    })

    // Move to next Monday
    startDate = addDays(startDate, 7)
  }

  // Batch write
  const batch = db.batch()
  let count = 0

  for (const challenge of challenges) {
    const docRef = challengesRef.doc()
    batch.set(docRef, challenge)
    count++

    // Firestore batch limit is 500
    if (count % 400 === 0) {
      await batch.commit()
      console.log(`Committed ${count} challenges...`)
    }
  }

  // Commit remaining
  await batch.commit()

  console.log(`Successfully seeded ${challenges.length} weekly challenges!`)
  console.log(`First challenge starts: ${challenges[0].startDate.toDate().toISOString()}`)
  console.log(`Last challenge ends: ${challenges[challenges.length - 1].endDate.toDate().toISOString()}`)

  process.exit(0)
}

seedChallenges().catch((error) => {
  console.error('Error seeding challenges:', error)
  process.exit(1)
})
