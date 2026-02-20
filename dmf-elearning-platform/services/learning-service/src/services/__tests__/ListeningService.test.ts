import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReviewStatus } from '@prisma/client';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    dictationAttempt: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    dictationExercise: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    listeningContent: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
      aggregate: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    userListeningProgress: {
      upsert: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    vocabularyItem: {
      findMany: vi.fn(),
    },
    userWordProgress: {
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
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

import { ListeningService } from '../ListeningService';

describe('ListeningService.submitAttempt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.dictationAttempt.create.mockResolvedValue({
      id: 'attempt-1',
      exerciseId: 'exercise-1',
    });
    mockPrisma.dictationExercise.findUnique.mockResolvedValue({
      contentId: 'content-1',
    });
    mockPrisma.dictationExercise.findMany.mockResolvedValue([{ id: 'exercise-1' }]);
    mockPrisma.dictationAttempt.findMany.mockResolvedValue([
      { exerciseId: 'exercise-1', accuracy: 50 },
    ]);
    mockPrisma.userListeningProgress.upsert.mockResolvedValue({});
    mockPrisma.$transaction.mockResolvedValue([]);
    mockPrisma.userWordProgress.upsert.mockResolvedValue({});
  });

  it('pushes incorrect dictation words into SRS queue as LEARNING with interval 1', async () => {
    const service = new ListeningService();
    mockPrisma.vocabularyItem.findMany.mockResolvedValue([{ id: 'word-1' }]);

    await service.submitAttempt('exercise-1', 'user_123456', {
      userText: 'Huas',
      accuracy: 40,
      wordsCorrect: 0,
      wordsTotal: 1,
      mistakes: [{ expected: 'Haus', actual: 'Huas', position: 0, type: 'wrong' }],
      listenCount: 1,
      timeSpent: 5,
    });

    expect(mockPrisma.vocabularyItem.findMany).toHaveBeenCalled();
    expect(mockPrisma.userWordProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          status: ReviewStatus.LEARNING,
          intervalDays: 1,
          repetitions: 0,
        }),
      })
    );
  });
});
