import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    $transaction: vi.fn(),
    userWordProgress: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    vocabularyReviewAttempt: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

import { getProgressStats, getReviewQueue, submitReview } from '../reviewService';

const TEST_USER_ID = 'user_123456';
const TEST_WORD_ID = 'ckv1234567890abcdef123456';

describe('reviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (operations: unknown[]) => Promise.all(operations as Promise<unknown>[]));
  });

  describe('getReviewQueue', () => {
    it('queries only due cards and requests DB-level sort by nextReview ascending', async () => {
      const dueCards = [
        {
          id: 'progress-1',
          userId: TEST_USER_ID,
          wordId: TEST_WORD_ID,
          nextReview: new Date('2026-02-19T00:00:00.000Z'),
          status: 'LEARNING',
          word: {
            id: TEST_WORD_ID,
            word: 'haus',
            meaning_vi: 'nhà',
            level: 'A1',
          },
        },
        {
          id: 'progress-2',
          userId: TEST_USER_ID,
          wordId: 'ckv2234567890abcdef123456',
          nextReview: new Date('2026-02-20T00:00:00.000Z'),
          status: 'REVIEW',
          word: {
            id: 'ckv2234567890abcdef123456',
            word: 'baum',
            meaning_vi: 'cây',
            level: 'A1',
          },
        },
      ];
      mockPrisma.userWordProgress.findMany.mockResolvedValueOnce(dueCards as any);

      const result = await getReviewQueue(TEST_USER_ID);

      expect(mockPrisma.userWordProgress.findMany).toHaveBeenCalledTimes(1);
      const query = mockPrisma.userWordProgress.findMany.mock.calls[0][0];
      expect(query.where.userId).toBe(TEST_USER_ID);
      expect(query.where.nextReview.lte).toBeInstanceOf(Date);
      expect(query.orderBy).toEqual({ nextReview: 'asc' });
      expect(query.take).toBe(20);
      expect(result.success).toBe(true);
      expect(result.data.count).toBe(2);
      expect(result.data.words[0]?.nextReview <= result.data.words[1]?.nextReview).toBe(true);
    });

    it('rejects invalid user id', async () => {
      await expect(getReviewQueue('bad')).rejects.toThrow('Failed to fetch review queue');
    });
  });

  describe('submitReview', () => {
    it('updates SRS fields using SM-2 output and increments counters', async () => {
      const existingProgress = {
        userId: TEST_USER_ID,
        wordId: TEST_WORD_ID,
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 1,
      };
      mockPrisma.userWordProgress.findUnique.mockResolvedValueOnce(existingProgress as any);
      mockPrisma.userWordProgress.update.mockResolvedValueOnce({
        ...existingProgress,
        status: 'REVIEW',
        word: {
          word: 'haus',
          meaning_vi: 'nhà',
        },
      } as any);
      mockPrisma.vocabularyReviewAttempt.create.mockResolvedValueOnce({
        id: 'attempt-1',
      } as any);

      const result = await submitReview(TEST_USER_ID, TEST_WORD_ID, 5);

      expect(mockPrisma.userWordProgress.findUnique).toHaveBeenCalledWith({
        where: {
          user_word_unique: {
            userId: TEST_USER_ID,
            wordId: TEST_WORD_ID,
          },
        },
      });
      expect(mockPrisma.userWordProgress.update).toHaveBeenCalledTimes(1);
      expect(mockPrisma.vocabularyReviewAttempt.create).toHaveBeenCalledWith({
        data: {
          userId: TEST_USER_ID,
          wordId: TEST_WORD_ID,
          quality: 5,
          source: 'review',
        },
      });
      const updatePayload = mockPrisma.userWordProgress.update.mock.calls[0][0];
      expect(updatePayload.where.user_word_unique).toEqual({
        userId: TEST_USER_ID,
        wordId: TEST_WORD_ID,
      });
      expect(updatePayload.data.easeFactor).toBeGreaterThanOrEqual(1.3);
      expect(updatePayload.data.intervalDays).toBeGreaterThanOrEqual(1);
      expect(updatePayload.data.repetitions).toBeGreaterThanOrEqual(1);
      expect(updatePayload.data.nextReview).toBeInstanceOf(Date);
      expect(updatePayload.data.status).toMatch(/NEW|LEARNING|REVIEW|MASTERED/);
      expect(updatePayload.data.totalReviews).toEqual({ increment: 1 });
      expect(updatePayload.data.correctReviews).toEqual({ increment: 1 });
      expect(result.success).toBe(true);
      expect(result.data.nextReview).toBeInstanceOf(Date);
    });

    it('rejects invalid quality and invalid IDs', async () => {
      await expect(submitReview(TEST_USER_ID, TEST_WORD_ID, 6 as any)).rejects.toThrow(
        'Failed to submit review'
      );
      await expect(submitReview('bad', TEST_WORD_ID, 4)).rejects.toThrow(
        'Failed to submit review'
      );
      await expect(submitReview(TEST_USER_ID, 'bad', 4)).rejects.toThrow(
        'Failed to submit review'
      );
    });
  });

  describe('getProgressStats', () => {
    it('returns aggregate stats with due count', async () => {
      mockPrisma.userWordProgress.findMany.mockResolvedValueOnce([
        { status: 'NEW', totalReviews: 0, correctReviews: 0 },
        { status: 'LEARNING', totalReviews: 2, correctReviews: 1 },
        { status: 'MASTERED', totalReviews: 3, correctReviews: 3 },
      ] as any);
      mockPrisma.userWordProgress.count.mockResolvedValueOnce(2);

      const result = await getProgressStats(TEST_USER_ID);

      expect(result.success).toBe(true);
      expect(result.data.total).toBe(3);
      expect(result.data.byStatus).toMatchObject({
        NEW: 1,
        LEARNING: 1,
        MASTERED: 1,
      });
      expect(result.data.totalReviews).toBe(5);
      expect(result.data.correctReviews).toBe(4);
      expect(result.data.accuracy).toBe(80);
      expect(result.data.dueToday).toBe(2);
    });
  });
});
