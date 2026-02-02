import { PrismaClient, Vocabulary } from '@prisma/client';

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
}
