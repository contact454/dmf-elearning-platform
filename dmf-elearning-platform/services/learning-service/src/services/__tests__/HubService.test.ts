import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    userWordProgress: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    vocabularyReviewAttempt: {
      count: vi.fn(),
    },
    vocabularyItem: {
      count: vi.fn(),
    },
    userReadingProgress: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    readingContent: {
      count: vi.fn(),
    },
    userListeningProgress: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    listeningContent: {
      count: vi.fn(),
    },
    userSpeakingProgress: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    speakingPrompt: {
      count: vi.fn(),
    },
    userWritingProgress: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    writingPrompt: {
      count: vi.fn(),
    },
    speakingAttempt: {
      count: vi.fn(),
    },
    writingSubmission: {
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
  ReviewStatus: {
    NEW: 'NEW',
    LEARNING: 'LEARNING',
    REVIEW: 'REVIEW',
    MASTERED: 'MASTERED',
  },
}));

import { HubService } from '../HubService';

describe('HubService.getHubData', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma.userWordProgress.findMany.mockResolvedValue([
      {
        status: 'NEW',
        updatedAt: new Date('2026-02-19T00:00:00.000Z'),
        word: { level: 'A1' },
      },
      {
        status: 'MASTERED',
        updatedAt: new Date('2026-02-20T00:00:00.000Z'),
        word: { level: 'B1' },
      },
    ]);
    mockPrisma.vocabularyItem.count.mockResolvedValue(100);

    mockPrisma.userReadingProgress.findMany.mockResolvedValue([
      {
        status: 'completed',
        updatedAt: new Date('2026-02-20T00:00:00.000Z'),
        completedAt: new Date('2026-02-20T00:00:00.000Z'),
        content: { level: 'B1' },
      },
    ]);
    mockPrisma.readingContent.count.mockResolvedValue(20);

    mockPrisma.userListeningProgress.findMany.mockResolvedValue([
      {
        status: 'completed',
        updatedAt: new Date('2026-02-20T00:00:00.000Z'),
        completedAt: new Date('2026-02-20T00:00:00.000Z'),
        content: { level: 'A2' },
      },
    ]);
    mockPrisma.listeningContent.count.mockResolvedValue(20);

    mockPrisma.userSpeakingProgress.findMany.mockResolvedValue([
      {
        status: 'attempted',
        updatedAt: new Date('2026-02-20T00:00:00.000Z'),
        lastAttemptAt: new Date('2026-02-20T00:00:00.000Z'),
        prompt: { level: 'A2' },
      },
    ]);
    mockPrisma.speakingPrompt.count.mockResolvedValue(30);

    mockPrisma.userWritingProgress.findMany.mockResolvedValue([
      {
        status: 'completed',
        updatedAt: new Date('2026-02-20T00:00:00.000Z'),
        lastSubmissionAt: new Date('2026-02-20T00:00:00.000Z'),
        prompt: { level: 'B1' },
      },
    ]);
    mockPrisma.writingPrompt.count.mockResolvedValue(20);

    mockPrisma.userWordProgress.count.mockImplementation(async (args: any) => {
      if (args?.where?.status === 'MASTERED') return 7;
      if (args?.where?.status === 'REVIEW') return 4;
      return 0;
    });
    mockPrisma.vocabularyReviewAttempt.count.mockResolvedValue(9);
    mockPrisma.userReadingProgress.count.mockImplementation(async (args: any) => {
      if (args?.where?.completedAt?.gte) return 1;
      return 3;
    });
    mockPrisma.userListeningProgress.count.mockImplementation(async (args: any) => {
      if (args?.where?.completedAt?.gte) return 1;
      return 2;
    });
    mockPrisma.userSpeakingProgress.count.mockResolvedValue(5);
    mockPrisma.userWritingProgress.count.mockResolvedValue(2);
    mockPrisma.speakingAttempt.count.mockResolvedValue(6);
    mockPrisma.writingSubmission.count.mockResolvedValue(4);

    mockPrisma.user.findUnique.mockResolvedValue({
      currentStreak: 8,
      longestStreak: 21,
      dailyGoalVocabulary: 10,
      dailyGoalReading: 1,
      dailyGoalListening: 1,
    });
  });

  it('returns real summary counters and daily goals with completion flags', async () => {
    const result = await HubService.getHubData('user_123456');

    expect(result.summary).toMatchObject({
      totalWordsLearned: 7,
      wordsInReview: 4,
      currentStreak: 8,
      readingCompleted: 3,
      listeningCompleted: 2,
      speakingCompleted: 5,
      writingCompleted: 2,
    });

    const vocabGoal = result.dailyGoals.find((goal) => goal.type === 'vocabulary');
    const readingGoal = result.dailyGoals.find((goal) => goal.type === 'reading');
    const listeningGoal = result.dailyGoals.find((goal) => goal.type === 'listening');

    expect(vocabGoal).toMatchObject({ target: 10, completed: 9, isCompleted: false });
    expect(readingGoal).toMatchObject({ target: 1, completed: 1, isCompleted: true });
    expect(listeningGoal).toMatchObject({ target: 1, completed: 1, isCompleted: true });
  });
});
