import { PrismaClient, Vocabulary, UserVocabularyProgress } from '@prisma/client';
import {
  calculateNextReview,
  mapRatingToQuality,
  calculateLearningStats,
  LearningStats,
} from '../utils/srs-algorithm';

const prisma = new PrismaClient();

export interface VocabularyFilters {
  level?: string;
  topic?: string;
  pos?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface VocabularyStats {
  total: number;
  byLevel: { level: string; count: number }[];
  byPos: { pos: string; count: number }[];
  byTopic: { topic: string; count: number }[];
}

export interface VocabularyWithProgress extends Vocabulary {
  progress?: UserVocabularyProgress | null;
}

export interface UserProgressStats extends LearningStats {
  streak: number;
  lastReviewDate: Date | null;
}

export class VocabularyService {
  /**
   * Get vocabulary with optional filters and pagination
   */
  async getVocabulary(filters: VocabularyFilters): Promise<{ items: Vocabulary[]; total: number }> {
    const where: any = {};

    if (filters.level) {
      where.level = filters.level.toUpperCase();
    }
    if (filters.topic) {
      where.topic = { contains: filters.topic, mode: 'insensitive' };
    }
    if (filters.pos) {
      where.pos = filters.pos.toLowerCase();
    }
    if (filters.search) {
      where.OR = [
        { word: { contains: filters.search, mode: 'insensitive' } },
        { meaning_vi: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.vocabulary.findMany({
        where,
        take: filters.limit || 50,
        skip: filters.offset || 0,
        orderBy: { word: 'asc' },
      }),
      prisma.vocabulary.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Get single vocabulary by ID
   */
  async getById(id: string): Promise<Vocabulary | null> {
    return prisma.vocabulary.findUnique({ where: { id } });
  }

  /**
   * Get single vocabulary by word
   */
  async getByWord(word: string): Promise<Vocabulary | null> {
    return prisma.vocabulary.findUnique({ where: { word } });
  }

  /**
   * Get random vocabulary for flashcard practice
   */
  async getRandom(count: number = 10, level?: string): Promise<Vocabulary[]> {
    const where: any = {};
    if (level) {
      where.level = level.toUpperCase();
    }

    // Get total count for random selection
    const total = await prisma.vocabulary.count({ where });
    if (total === 0) return [];

    // Generate random offsets
    const randomOffsets = new Set<number>();
    const targetCount = Math.min(count, total);
    while (randomOffsets.size < targetCount) {
      randomOffsets.add(Math.floor(Math.random() * total));
    }

    // Fetch items at random offsets
    const items = await Promise.all(
      Array.from(randomOffsets).map(offset =>
        prisma.vocabulary.findFirst({ where, skip: offset })
      )
    );

    return items.filter((item): item is Vocabulary => item !== null);
  }

  /**
   * Get vocabulary statistics
   */
  async getStats(): Promise<VocabularyStats> {
    const [total, byLevel, byPos, byTopic] = await Promise.all([
      prisma.vocabulary.count(),
      prisma.vocabulary.groupBy({
        by: ['level'],
        _count: true,
        orderBy: { level: 'asc' },
      }),
      prisma.vocabulary.groupBy({
        by: ['pos'],
        _count: true,
        orderBy: { _count: { pos: 'desc' } },
      }),
      prisma.vocabulary.groupBy({
        by: ['topic'],
        _count: true,
        orderBy: { _count: { topic: 'desc' } },
        take: 20,
      }),
    ]);

    return {
      total,
      byLevel: byLevel.map(l => ({ level: l.level, count: l._count })),
      byPos: byPos
        .filter(p => p.pos !== null)
        .map(p => ({ pos: p.pos!, count: p._count })),
      byTopic: byTopic
        .filter(t => t.topic !== null)
        .map(t => ({ topic: t.topic!, count: t._count })),
    };
  }

  /**
   * Get all unique levels
   */
  async getLevels(): Promise<string[]> {
    const result = await prisma.vocabulary.findMany({
      distinct: ['level'],
      select: { level: true },
      orderBy: { level: 'asc' },
    });
    return result.map(r => r.level);
  }

  /**
   * Get all unique topics for a level
   */
  async getTopics(level?: string): Promise<string[]> {
    const where: any = { topic: { not: null } };
    if (level) {
      where.level = level.toUpperCase();
    }

    const result = await prisma.vocabulary.findMany({
      where,
      distinct: ['topic'],
      select: { topic: true },
      orderBy: { topic: 'asc' },
    });

    return result.map(r => r.topic).filter((t): t is string => t !== null);
  }

  /**
   * Delete vocabulary by ID
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      await prisma.vocabulary.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete multiple vocabulary by IDs
   */
  async deleteMany(ids: string[]): Promise<number> {
    const result = await prisma.vocabulary.deleteMany({
      where: { id: { in: ids } },
    });
    return result.count;
  }

  // ═══════════════════════════════════════════════════════════════
  // SRS (Spaced Repetition System) Methods
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get vocabulary cards due for review
   */
  async getDueCards(
    userId: string,
    limit: number = 20,
    level?: string
  ): Promise<VocabularyWithProgress[]> {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Get existing progress records that are due
    const dueProgress = await prisma.userVocabularyProgress.findMany({
      where: {
        userId,
        OR: [
          { nextReviewAt: null },
          { nextReviewAt: { lte: now } },
        ],
      },
      include: { vocabulary: true },
      orderBy: { nextReviewAt: 'asc' },
      take: limit,
    });

    // Map to VocabularyWithProgress format
    const dueCards: VocabularyWithProgress[] = dueProgress.map(p => ({
      ...p.vocabulary,
      progress: p,
    }));

    // If we need more cards, get new vocabulary (no progress yet)
    if (dueCards.length < limit) {
      const existingVocabIds = dueProgress.map(p => p.vocabId);
      const whereClause: any = {
        id: { notIn: existingVocabIds },
      };
      if (level) {
        whereClause.level = level.toUpperCase();
      }

      const newVocab = await prisma.vocabulary.findMany({
        where: whereClause,
        take: limit - dueCards.length,
        orderBy: { word: 'asc' },
      });

      for (const vocab of newVocab) {
        dueCards.push({ ...vocab, progress: null });
      }
    }

    return dueCards;
  }

  /**
   * Submit a review and update SRS parameters
   */
  async submitReview(
    userId: string,
    vocabId: string,
    rating: number // 0=Again, 1=Hard, 2=Good, 3=Easy
  ): Promise<UserVocabularyProgress> {
    const quality = mapRatingToQuality(rating);

    // Get or create progress record
    let progress = await prisma.userVocabularyProgress.findUnique({
      where: {
        userId_vocabId: { userId, vocabId },
      },
    });

    if (!progress) {
      // Create new progress record
      progress = await prisma.userVocabularyProgress.create({
        data: {
          userId,
          vocabId,
          status: 'new',
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
        },
      });
    }

    // Calculate next review using SM-2 algorithm
    const srsUpdate = calculateNextReview(quality, {
      easeFactor: progress.easeFactor,
      interval: progress.interval,
      repetitions: progress.repetitions,
    });

    // Update progress
    const isCorrect = quality >= 3;
    const updatedProgress = await prisma.userVocabularyProgress.update({
      where: { id: progress.id },
      data: {
        easeFactor: srsUpdate.easeFactor,
        interval: srsUpdate.interval,
        repetitions: srsUpdate.repetitions,
        nextReviewAt: srsUpdate.nextReviewAt,
        status: srsUpdate.status,
        lastReviewedAt: new Date(),
        totalReviews: { increment: 1 },
        correctReviews: isCorrect ? { increment: 1 } : undefined,
        lapseCount: rating === 0 ? { increment: 1 } : undefined,
      },
    });

    return updatedProgress;
  }

  /**
   * Get user's learning progress statistics
   */
  async getUserProgress(userId: string): Promise<UserProgressStats> {
    const progressRecords = await prisma.userVocabularyProgress.findMany({
      where: { userId },
      select: {
        status: true,
        nextReviewAt: true,
        easeFactor: true,
        correctReviews: true,
        totalReviews: true,
        lastReviewedAt: true,
      },
    });

    // Calculate learning stats
    const stats = calculateLearningStats(progressRecords);

    // Calculate streak (consecutive days with reviews)
    let streak = 0;
    let lastReviewDate: Date | null = null;

    if (progressRecords.length > 0) {
      const reviewDates = progressRecords
        .filter(p => p.lastReviewedAt)
        .map(p => p.lastReviewedAt!)
        .sort((a, b) => b.getTime() - a.getTime());

      if (reviewDates.length > 0) {
        lastReviewDate = reviewDates[0];

        // Count consecutive days
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastReview = new Date(lastReviewDate);
        lastReview.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor(
          (today.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff <= 1) {
          streak = 1;
          // TODO: Query historical data to calculate actual streak
        }
      }
    }

    return {
      ...stats,
      streak,
      lastReviewDate,
    };
  }

  /**
   * Get vocabulary with user progress for a specific user
   */
  async getVocabularyWithProgress(
    userId: string,
    filters: VocabularyFilters
  ): Promise<{ items: VocabularyWithProgress[]; total: number }> {
    const where: any = {};

    if (filters.level) {
      where.level = filters.level.toUpperCase();
    }
    if (filters.topic) {
      where.topic = { contains: filters.topic, mode: 'insensitive' };
    }
    if (filters.pos) {
      where.pos = filters.pos.toLowerCase();
    }
    if (filters.search) {
      where.OR = [
        { word: { contains: filters.search, mode: 'insensitive' } },
        { meaning_vi: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.vocabulary.findMany({
        where,
        take: filters.limit || 50,
        skip: filters.offset || 0,
        orderBy: { word: 'asc' },
        include: {
          progress: {
            where: { userId },
            take: 1,
          },
        },
      }),
      prisma.vocabulary.count({ where }),
    ]);

    // Transform to VocabularyWithProgress format
    const itemsWithProgress: VocabularyWithProgress[] = items.map(item => ({
      ...item,
      progress: item.progress[0] || null,
    }));

    return { items: itemsWithProgress, total };
  }
}
