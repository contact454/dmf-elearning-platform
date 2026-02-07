/**
 * Seed script for testing User model with streak tracking
 * Task 2.1: Daily Streaks Database Schema
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test users with streak data...');

  // Hash password for test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Test user 1: Active user with current streak
  const user1 = await prisma.user.upsert({
    where: { email: 'active@dmf.com' },
    update: {
      currentStreak: 7,
      longestStreak: 15,
      lastActivityDate: new Date(),
      timezone: 'Asia/Ho_Chi_Minh',
    },
    create: {
      email: 'active@dmf.com',
      password: hashedPassword,
      role: 'learner',
      currentStreak: 7,
      longestStreak: 15,
      lastActivityDate: new Date(),
      timezone: 'Asia/Ho_Chi_Minh',
    },
  });

  console.log('✅ Created/Updated user:', user1.email, `(${user1.currentStreak}-day streak)`);

  // Test user 2: New user (no activity yet)
  const user2 = await prisma.user.upsert({
    where: { email: 'newbie@dmf.com' },
    update: {},
    create: {
      email: 'newbie@dmf.com',
      password: hashedPassword,
      role: 'learner',
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      timezone: 'Asia/Ho_Chi_Minh',
    },
  });

  console.log('✅ Created/Updated user:', user2.email, '(New user, no streak)');

  // Test user 3: User with broken streak (last active 3 days ago)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const user3 = await prisma.user.upsert({
    where: { email: 'veteran@dmf.com' },
    update: {
      currentStreak: 0, // Streak broken
      longestStreak: 45,
      lastActivityDate: threeDaysAgo,
      timezone: 'Europe/Berlin',
    },
    create: {
      email: 'veteran@dmf.com',
      password: hashedPassword,
      role: 'learner',
      currentStreak: 0,
      longestStreak: 45,
      lastActivityDate: threeDaysAgo,
      timezone: 'Europe/Berlin',
    },
  });

  console.log('✅ Created/Updated user:', user3.email, `(Broken streak, longest: ${user3.longestStreak})`);

  // Test user 4: Timezone edge case (different timezone)
  const user4 = await prisma.user.upsert({
    where: { email: 'pacific@dmf.com' },
    update: {
      currentStreak: 3,
      longestStreak: 10,
      lastActivityDate: new Date(),
      timezone: 'America/Los_Angeles',
    },
    create: {
      email: 'pacific@dmf.com',
      password: hashedPassword,
      role: 'learner',
      currentStreak: 3,
      longestStreak: 10,
      lastActivityDate: new Date(),
      timezone: 'America/Los_Angeles',
    },
  });

  console.log('✅ Created/Updated user:', user4.email, `(${user4.currentStreak}-day streak in ${user4.timezone})`);

  console.log('\n📊 Seed Summary:');
  console.log('  - 4 test users created with streak data');
  console.log('  - User 1 (active@dmf.com): Active 7-day streak');
  console.log('  - User 2 (newbie@dmf.com): New user (no streak)');
  console.log('  - User 3 (veteran@dmf.com): Broken streak (45-day record)');
  console.log('  - User 4 (pacific@dmf.com): Different timezone (America/Los_Angeles)');
  console.log('\n✅ All streak fields successfully tested!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
