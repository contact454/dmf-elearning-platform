import path from 'path';
import { config as loadEnv } from 'dotenv';
import { PrismaClient, ReviewStatus } from '@prisma/client';
import { getReviewQueue, submitReview } from '../src/services/reviewService';

const prisma = new PrismaClient();

function loadEnvFiles() {
  const serviceRoot = process.cwd();
  const repoRoot = path.resolve(serviceRoot, '..', '..');

  loadEnv({ path: path.join(repoRoot, '.env.local'), override: false });
  loadEnv({ path: path.join(repoRoot, 'apps/web-learner/.env.local'), override: false });
  loadEnv({ path: path.join(serviceRoot, '.env'), override: false });
}

function assertCondition(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  loadEnvFiles();

  const userId = process.env.PHASE3_SMOKE_USER_ID || 'phase3-smoke-user-001';
  const email = process.env.PHASE3_SMOKE_EMAIL || 'phase3.smoke.user@example.com';

  const wordSeeds = [
    { token: 'phase3_smoke_alpha', meaning: 'alpha smoke' },
    { token: 'phase3_smoke_beta', meaning: 'beta smoke' },
    { token: 'phase3_smoke_gamma', meaning: 'gamma smoke' },
    { token: 'phase3_smoke_future', meaning: 'future smoke' },
  ];

  console.log('[Phase3 smoke] Seeding user and vocabulary fixtures...');

  await prisma.user.upsert({
    where: { id: userId },
    update: {
      email,
      name: 'Phase3 Smoke User',
      timezone: 'UTC',
    },
    create: {
      id: userId,
      email,
      name: 'Phase3 Smoke User',
      timezone: 'UTC',
    },
  });

  const vocabularyItems = await Promise.all(
    wordSeeds.map((seed, index) =>
      prisma.vocabularyItem.upsert({
        where: { word: seed.token },
        update: {
          meaning_vi: seed.meaning,
          level: 'A1',
          topic: 'smoke',
          source: 'phase3-core-loop-smoke',
          pos: index % 2 === 0 ? 'noun' : 'verb',
        },
        create: {
          word: seed.token,
          meaning_vi: seed.meaning,
          level: 'A1',
          topic: 'smoke',
          source: 'phase3-core-loop-smoke',
          pos: index % 2 === 0 ? 'noun' : 'verb',
          familyWords: [],
          grammarTags: [],
          addedAt: new Date(),
        },
        select: { id: true, word: true },
      })
    )
  );

  const wordIds = vocabularyItems.map((item) => item.id);

  await prisma.$transaction([
    prisma.vocabularyReviewAttempt.deleteMany({
      where: {
        userId,
        wordId: { in: wordIds },
      },
    }),
    prisma.userWordProgress.deleteMany({
      where: {
        userId,
        wordId: { in: wordIds },
      },
    }),
  ]);

  const now = Date.now();
  const dueTimestamps = [
    new Date(now - 4 * 24 * 60 * 60 * 1000), // oldest due
    new Date(now - 2 * 24 * 60 * 60 * 1000),
    new Date(now - 1 * 60 * 60 * 1000),
    new Date(now + 24 * 60 * 60 * 1000), // future, should be excluded
  ];

  await prisma.userWordProgress.createMany({
    data: vocabularyItems.map((item, index) => ({
      userId,
      wordId: item.id,
      easeFactor: 2.5,
      intervalDays: 1,
      repetitions: index,
      nextReview: dueTimestamps[index],
      status: index === 0 ? ReviewStatus.LEARNING : ReviewStatus.REVIEW,
      lastResult: index % 2 === 0 ? false : true,
      totalReviews: index,
      correctReviews: Math.max(0, index - 1),
    })),
  });

  console.log('[Phase3 smoke] Verifying queue order and due filtering...');
  const queueResult = await getReviewQueue(userId);

  assertCondition(queueResult.success, 'Queue call failed');
  assertCondition(queueResult.data.count === 3, `Expected 3 due cards, got ${queueResult.data.count}`);

  const queue = queueResult.data.words;
  assertCondition(queue.length === 3, `Expected queue length 3, got ${queue.length}`);

  for (let i = 1; i < queue.length; i += 1) {
    const prev = new Date(queue[i - 1].nextReview).getTime();
    const current = new Date(queue[i].nextReview).getTime();
    assertCondition(prev <= current, 'Queue is not sorted by nextReview ascending');
  }

  const hasFutureWord = queue.some((entry) => entry.word.word === 'phase3_smoke_future');
  assertCondition(!hasFutureWord, 'Queue incorrectly included future review item');

  const firstCard = queue[0];
  console.log(
    `[Phase3 smoke] Submitting review for word=${firstCard.word.word}, wordId=${firstCard.word.id}...`
  );

  const submitResult = await submitReview(userId, firstCard.word.id, 5);
  assertCondition(submitResult.success, 'Submit review failed');

  const updatedProgress = await prisma.userWordProgress.findUnique({
    where: {
      user_word_unique: {
        userId,
        wordId: firstCard.word.id,
      },
    },
  });

  assertCondition(updatedProgress, 'Updated progress not found after submit');
  assertCondition(updatedProgress.totalReviews >= 1, 'totalReviews was not incremented');
  assertCondition(
    updatedProgress.correctReviews >= 1,
    'correctReviews was not incremented for quality >= 3'
  );
  assertCondition(
    updatedProgress.nextReview.getTime() > now,
    'nextReview was not moved to a future timestamp'
  );
  assertCondition(updatedProgress.intervalDays >= 1, 'intervalDays is invalid after submit');
  assertCondition(updatedProgress.easeFactor >= 1.3, 'easeFactor is below SM-2 minimum');

  const attempts = await prisma.vocabularyReviewAttempt.findMany({
    where: {
      userId,
      wordId: firstCard.word.id,
      source: 'review',
    },
    orderBy: { createdAt: 'desc' },
    take: 1,
  });
  assertCondition(attempts.length === 1, 'Review attempt was not persisted');
  assertCondition(attempts[0].quality === 5, 'Persisted review quality is incorrect');

  console.log('[Phase3 smoke] PASS');
  console.log(
    JSON.stringify(
      {
        userId,
        dueCount: queueResult.data.count,
        reviewedWordId: firstCard.word.id,
        updatedStatus: updatedProgress.status,
        updatedIntervalDays: updatedProgress.intervalDays,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error('[Phase3 smoke] FAIL', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
