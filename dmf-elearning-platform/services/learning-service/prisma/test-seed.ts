import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get or create test user
  let testUser = await prisma.user.findFirst({ where: { email: 'test@dmf.test' }})
  
  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: 'test@dmf.test',
        name: 'Test User',
        currentStreak: 5,
        longestStreak: 10,
        lastActivityDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        timezone: 'Asia/Saigon'
      }
    })
  }
  
  console.log('Test user ID:', testUser.id)

  // Get some vocabulary words
  const words = await prisma.vocabularyItem.findMany({ take: 10 })
  console.log('Found', words.length, 'vocabulary words')

  // Create progress entries using unique constraint
  for (const word of words.slice(0, 5)) {
    await prisma.userWordProgress.upsert({
      where: {
        user_word_unique: {
          userId: testUser.id,
          wordId: word.id
        }
      },
      update: {
        nextReview: new Date() // due today
      },
      create: {
        userId: testUser.id,
        wordId: word.id,
        status: 'NEW',
        intervalDays: 0,
        easeFactor: 2.5,
        repetitions: 0,
        nextReview: new Date()
      }
    })
  }

  console.log('Created 5 word progress entries for test user')
  console.log('USE THIS USER ID FOR TESTING:', testUser.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
