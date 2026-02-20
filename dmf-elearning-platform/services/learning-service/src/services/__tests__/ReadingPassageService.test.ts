import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReviewStatus } from '@prisma/client';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    vocabularyItem: {
      upsert: vi.fn(),
    },
    userWordProgress: {
      upsert: vi.fn(),
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

import { ReadingPassageService } from '../ReadingPassageService';

describe('ReadingPassageService.saveVocabulary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates/links vocabulary and resets SRS state to NEW', async () => {
    const service = new ReadingPassageService();

    mockPrisma.vocabularyItem.upsert.mockResolvedValueOnce({
      id: 'ckv1234567890abcdef123456',
      word: 'haus',
    });
    mockPrisma.userWordProgress.upsert.mockResolvedValueOnce({
      nextReview: new Date('2026-02-20T00:00:00.000Z'),
      status: ReviewStatus.NEW,
    });

    const result = await service.saveVocabulary({
      userId: 'user_123456',
      passageId: 'passage-uuid-001',
      word: ' Haus ',
      translation: ' nhà ',
      context: 'A short sentence',
      sentence: 'Das Haus ist klein.',
    });

    expect(mockPrisma.vocabularyItem.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { word: 'haus' },
      })
    );
    expect(mockPrisma.userWordProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          status: ReviewStatus.NEW,
          intervalDays: 1,
          repetitions: 0,
          totalReviews: 0,
          correctReviews: 0,
        }),
      })
    );
    expect(result.addedToSRS).toBe(true);
    expect(result.status).toBe(ReviewStatus.NEW);
  });
});
