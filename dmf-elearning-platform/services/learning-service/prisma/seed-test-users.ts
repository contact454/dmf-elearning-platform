/**
 * Seed script for testing User model with streak tracking
 * Task 2.1: Daily Streaks Database Schema
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test users with streak data...');

  // Test user 1: Active user with streak
  const user1 = await prisma.user.upsert({
    where: { email: 'test@dmf.com' },
    update: {},
    create: {
      id: 'test-user-1',
      email: 'test@dmf.com',
      name: 'Test User 1',
      currentStreak: 5,
      longestStreak: 15,
      lastActivityDate: new Date(),
      timezone: 'Asia/Ho_Chi_Minh',
    },
  });

  console.log('✅ Created/Updated user:', user1.email);

  // Test user 2: New user (no streak)
  const user2 = await prisma.user.upsert({
    where: { email: 'newbie@dmf.com' },
    update: {},
    create: {
      id: 'test-user-2',
      email: 'newbie@dmf.com',
      name: 'New User',
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      timezone: 'Asia/Ho_Chi_Minh',
    },
  });

  console.log('✅ Created/Updated user:', user2.email);

  // Test user 3: User with broken streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 2);

  const user3 = await prisma.user.upsert({
    where: { email: 'veteran@dmf.com' },
    update: {},
    create: {
      id: 'test-user-3',
      email: 'veteran@dmf.com',
      name: 'Veteran User',
      currentStreak: 0, // Broken streak
      longestStreak: 30,
      lastActivityDate: yesterday,
      timezone: 'Europe/Berlin',
    },
  });

  console.log('✅ Created/Updated user:', user3.email);

  // Create some vocabulary progress for user1
  // First, get a sample vocabulary item
  const sampleWord = await prisma.vocabularyItem.findFirst({
    where: { word: 'Hallo' },
  });

  if (sampleWord) {
    const progress = await prisma.userWordProgress.upsert({
      where: {
        userId_wordId: {
          userId: user1.id,
          wordId: sampleWord.id,
        },
      },
      update: {},
      create: {
        userId: user1.id,
        wordId: sampleWord.id,
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 0,
        nextReview: new Date(), // Due today
        status: 'NEW',
        totalReviews: 0,
        correctReviews: 0,
      },
    });

    console.log('✅ Created word progress for user1:', progress.id);
  } else {
    console.log('⚠️ No vocabulary found - run seed-vocabulary first');
  }

  console.log('\n📊 Seed Summary:');
  console.log('  - 3 test users created');
  console.log('  - User 1: Active (5-day streak)');
  console.log('  - User 2: New user (no streak)');
  console.log('  - User 3: Veteran (broken streak)');
  console.log('  - Sample word progress created for User 1');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
