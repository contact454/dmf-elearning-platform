import path from 'path';
import { config as loadEnv } from 'dotenv';
import { PrismaClient, ReviewStatus } from '@prisma/client';
import { ReadingPassageService } from '../src/services/ReadingPassageService';
import { ListeningService } from '../src/services/ListeningService';
import { HubService } from '../src/services/HubService';

const prisma = new PrismaClient();
const readingPassageService = new ReadingPassageService();
const listeningService = new ListeningService();

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

  const userId = process.env.PHASE3_FEEDBACK_SMOKE_USER_ID || 'phase3-feedback-user-001';
  const email = process.env.PHASE3_FEEDBACK_SMOKE_EMAIL || 'phase3.feedback.user@example.com';
  const now = Date.now();

  const readingWord = 'phase3feedbackreading';
  const listeningWord = 'phase3feedbacklisten';
  const masteredWord = 'phase3feedbackmastered';
  const reviewWord = 'phase3feedbackreview';

  console.log('[Phase3 feedback/hub smoke] Seeding baseline user and vocabulary...');

  await prisma.user.upsert({
    where: { id: userId },
    update: {
      email,
      name: 'Phase3 Feedback Smoke User',
      timezone: 'UTC',
    },
    create: {
      id: userId,
      email,
      name: 'Phase3 Feedback Smoke User',
      timezone: 'UTC',
    },
  });

  const vocab = await Promise.all(
    [readingWord, listeningWord, masteredWord, reviewWord].map((word) =>
      prisma.vocabularyItem.upsert({
        where: { word },
        update: {
          meaning_vi: `${word} meaning`,
          level: 'A1',
          topic: 'smoke',
          source: 'phase3-feedback-hub-smoke',
          pos: 'noun',
        },
        create: {
          word,
          meaning_vi: `${word} meaning`,
          level: 'A1',
          topic: 'smoke',
          source: 'phase3-feedback-hub-smoke',
          pos: 'noun',
          familyWords: [],
          grammarTags: [],
          addedAt: new Date(),
        },
        select: { id: true, word: true },
      })
    )
  );

  const vocabByWord = new Map(vocab.map((item) => [item.word, item.id]));

  await prisma.$transaction([
    prisma.vocabularyReviewAttempt.deleteMany({ where: { userId } }),
    prisma.userWordProgress.deleteMany({ where: { userId } }),
    prisma.userReadingProgress.deleteMany({ where: { userId } }),
    prisma.userListeningProgress.deleteMany({ where: { userId } }),
    prisma.userSpeakingProgress.deleteMany({ where: { userId } }),
    prisma.userWritingProgress.deleteMany({ where: { userId } }),
    prisma.dictationAttempt.deleteMany({ where: { userId } }),
  ]);

  console.log('[Phase3 feedback/hub smoke] Verifying reading unknown-word reset -> NEW...');
  await prisma.userWordProgress.create({
    data: {
      userId,
      wordId: vocabByWord.get(readingWord)!,
      easeFactor: 2.9,
      intervalDays: 14,
      repetitions: 6,
      nextReview: new Date(now + 7 * 24 * 60 * 60 * 1000),
      status: ReviewStatus.MASTERED,
      lastResult: true,
      totalReviews: 20,
      correctReviews: 18,
    },
  });

  await readingPassageService.saveVocabulary({
    userId,
    passageId: 'phase3-feedback-passage',
    word: readingWord,
    translation: 'reading reset meaning',
    context: 'Reading context',
    sentence: 'Das ist ein Beispielsatz.',
  });

  const readingProgress = await prisma.userWordProgress.findUnique({
    where: {
      user_word_unique: {
        userId,
        wordId: vocabByWord.get(readingWord)!,
      },
    },
  });

  assertCondition(readingProgress, 'Reading word progress missing after saveVocabulary');
  assertCondition(readingProgress.status === ReviewStatus.NEW, 'Reading save did not set status NEW');
  assertCondition(readingProgress.intervalDays === 1, 'Reading save did not reset intervalDays to 1');
  assertCondition(readingProgress.repetitions === 0, 'Reading save did not reset repetitions to 0');
  assertCondition(readingProgress.totalReviews === 0, 'Reading save did not reset totalReviews');
  assertCondition(readingProgress.correctReviews === 0, 'Reading save did not reset correctReviews');

  console.log('[Phase3 feedback/hub smoke] Verifying dictation mistake reset -> LEARNING...');
  await prisma.userWordProgress.create({
    data: {
      userId,
      wordId: vocabByWord.get(listeningWord)!,
      easeFactor: 2.8,
      intervalDays: 10,
      repetitions: 5,
      nextReview: new Date(now + 4 * 24 * 60 * 60 * 1000),
      status: ReviewStatus.MASTERED,
      lastResult: true,
      totalReviews: 12,
      correctReviews: 10,
    },
  });

  const listeningContent = await prisma.listeningContent.create({
    data: {
      title: `Phase3 feedback listening ${Date.now()}`,
      description: 'Smoke content',
      level: 'A1',
      topic: 'smoke',
      transcript: `${listeningWord} ist hier im Text`,
      transcriptVi: 'Bản dịch',
      source: 'phase3-feedback-hub-smoke',
      vocabularyList: [],
      wordCount: 5,
      duration: 12,
      isPublished: true,
    },
  });

  const dictationExercise = await prisma.dictationExercise.create({
    data: {
      contentId: listeningContent.id,
      exerciseType: 'segment',
      segmentIndex: 0,
      audioStart: 0,
      audioEnd: 5,
      correctText: `${listeningWord} ist hier`,
      hints: [],
      difficulty: 2,
    },
  });

  await listeningService.submitAttempt(dictationExercise.id, userId, {
    userText: 'typed wrong',
    accuracy: 40,
    wordsCorrect: 1,
    wordsTotal: 3,
    mistakes: [
      {
        expected: listeningWord,
        actual: 'wrong-token',
        position: 0,
        type: 'wrong',
      },
    ],
    listenCount: 1,
    timeSpent: 15,
  });

  const listeningProgressWord = await prisma.userWordProgress.findUnique({
    where: {
      user_word_unique: {
        userId,
        wordId: vocabByWord.get(listeningWord)!,
      },
    },
  });

  assertCondition(listeningProgressWord, 'Listening word progress missing after dictation attempt');
  assertCondition(
    listeningProgressWord.status === ReviewStatus.LEARNING,
    'Listening mistake did not set status LEARNING'
  );
  assertCondition(
    listeningProgressWord.intervalDays === 1,
    'Listening mistake did not reset intervalDays to 1'
  );
  assertCondition(
    listeningProgressWord.repetitions === 0,
    'Listening mistake did not reset repetitions to 0'
  );

  console.log('[Phase3 feedback/hub smoke] Seeding hub summary counters...');
  await prisma.userWordProgress.createMany({
    data: [
      {
        userId,
        wordId: vocabByWord.get(masteredWord)!,
        easeFactor: 2.5,
        intervalDays: 8,
        repetitions: 4,
        nextReview: new Date(now + 8 * 24 * 60 * 60 * 1000),
        status: ReviewStatus.MASTERED,
        lastResult: true,
        totalReviews: 9,
        correctReviews: 8,
      },
      {
        userId,
        wordId: vocabByWord.get(reviewWord)!,
        easeFactor: 2.4,
        intervalDays: 3,
        repetitions: 2,
        nextReview: new Date(now + 2 * 24 * 60 * 60 * 1000),
        status: ReviewStatus.REVIEW,
        lastResult: true,
        totalReviews: 4,
        correctReviews: 3,
      },
    ],
  });

  const readingContent = await prisma.readingContent.create({
    data: {
      title: `Phase3 feedback reading ${Date.now()}`,
      content: 'Das ist ein kurzer Testtext fuer Reading.',
      level: 'A1',
      topic: 'smoke',
      wordCount: 8,
      uniqueWords: 8,
      difficultyScore: 10,
      vocabularyList: [],
      source: 'phase3-feedback-hub-smoke',
      estimatedTime: 2,
      isPublished: true,
    },
  });

  await prisma.userReadingProgress.create({
    data: {
      userId,
      contentId: readingContent.id,
      status: 'completed',
      progressPercent: 100,
      wordsRead: 8,
      totalReadTime: 120,
      completedAt: new Date(),
    },
  });

  await prisma.userListeningProgress.upsert({
    where: {
      userId_contentId: {
        userId,
        contentId: listeningContent.id,
      },
    },
    update: {
      status: 'completed',
      progressPercent: 100,
      exercisesCompleted: 1,
      exercisesTotal: 1,
      averageAccuracy: 80,
      completedAt: new Date(),
    },
    create: {
      userId,
      contentId: listeningContent.id,
      status: 'completed',
      progressPercent: 100,
      exercisesCompleted: 1,
      exercisesTotal: 1,
      averageAccuracy: 80,
      completedAt: new Date(),
    },
  });

  const speakingPrompt = await prisma.speakingPrompt.create({
    data: {
      title: `Phase3 feedback speaking ${Date.now()}`,
      level: 'A1',
      topic: 'smoke',
      category: 'general',
      promptText: 'Sag etwas auf Deutsch.',
      targetWords: [],
      phonetics: [],
      tags: ['phase3-feedback-hub-smoke'],
      difficulty: 1,
      estimatedTime: 30,
      isPublished: true,
    },
  });

  await prisma.userSpeakingProgress.create({
    data: {
      userId,
      promptId: speakingPrompt.id,
      status: 'attempted',
      attemptCount: 1,
      bestScore: 75,
      lastScore: 75,
    },
  });

  const writingPrompt = await prisma.writingPrompt.create({
    data: {
      title: `Phase3 feedback writing ${Date.now()}`,
      level: 'A1',
      topic: 'smoke',
      category: 'free_writing',
      promptText: 'Schreibe drei Saetze.',
      hints: [],
      keywords: [],
      grammarPoints: [],
      vocabularyFocus: [],
      tags: ['phase3-feedback-hub-smoke'],
      difficulty: 1,
      estimatedTime: 120,
      minWords: 0,
      isPublished: true,
    },
  });

  await prisma.userWritingProgress.create({
    data: {
      userId,
      promptId: writingPrompt.id,
      status: 'completed',
      submissionCount: 1,
      bestScore: 82,
      lastScore: 82,
      lastSubmissionAt: new Date(),
    },
  });

  await prisma.vocabularyReviewAttempt.createMany({
    data: [
      {
        userId,
        wordId: vocabByWord.get(reviewWord)!,
        quality: 4,
        source: 'review',
      },
      {
        userId,
        wordId: vocabByWord.get(masteredWord)!,
        quality: 5,
        source: 'review',
      },
    ],
  });

  const hubData = await HubService.getHubData(userId);
  assertCondition(hubData.summary.totalWordsLearned === 1, 'Hub summary totalWordsLearned mismatch');
  assertCondition(hubData.summary.wordsInReview === 1, 'Hub summary wordsInReview mismatch');
  assertCondition(hubData.summary.readingCompleted === 1, 'Hub summary readingCompleted mismatch');
  assertCondition(hubData.summary.listeningCompleted === 1, 'Hub summary listeningCompleted mismatch');
  assertCondition(hubData.summary.speakingCompleted === 1, 'Hub summary speakingCompleted mismatch');
  assertCondition(hubData.summary.writingCompleted === 1, 'Hub summary writingCompleted mismatch');

  const vocabGoal = hubData.dailyGoals.find((goal) => goal.type === 'vocabulary');
  const readingGoal = hubData.dailyGoals.find((goal) => goal.type === 'reading');
  const listeningGoal = hubData.dailyGoals.find((goal) => goal.type === 'listening');
  assertCondition(vocabGoal?.completed === 2, 'Daily vocabulary completed count mismatch');
  assertCondition(readingGoal?.completed === 1, 'Daily reading completed count mismatch');
  assertCondition(listeningGoal?.completed === 1, 'Daily listening completed count mismatch');

  const updatedGoals = await HubService.updateDailyGoals(userId, {
    vocabulary: 3,
    reading: 2,
    listening: 2,
  });
  const updatedVocabularyGoal = updatedGoals.find((goal) => goal.type === 'vocabulary');
  const updatedReadingGoal = updatedGoals.find((goal) => goal.type === 'reading');
  const updatedListeningGoal = updatedGoals.find((goal) => goal.type === 'listening');
  assertCondition(updatedVocabularyGoal?.target === 3, 'Failed to persist vocabulary daily goal target');
  assertCondition(updatedReadingGoal?.target === 2, 'Failed to persist reading daily goal target');
  assertCondition(updatedListeningGoal?.target === 2, 'Failed to persist listening daily goal target');
  assertCondition(updatedVocabularyGoal?.completed === 2, 'Updated vocabulary completed count mismatch');
  assertCondition(updatedReadingGoal?.completed === 1, 'Updated reading completed count mismatch');
  assertCondition(updatedListeningGoal?.completed === 1, 'Updated listening completed count mismatch');

  console.log('[Phase3 feedback/hub smoke] PASS');
  console.log(
    JSON.stringify(
      {
        userId,
        readingStatusAfterSave: readingProgress.status,
        listeningStatusAfterMistake: listeningProgressWord.status,
        summary: hubData.summary,
        updatedGoalTargets: {
          vocabulary: updatedVocabularyGoal?.target,
          reading: updatedReadingGoal?.target,
          listening: updatedListeningGoal?.target,
        },
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error('[Phase3 feedback/hub smoke] FAIL', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
