import { PrismaClient, ReadingContent, UserReadingProgress } from '@prisma/client';
import {
  analyzeContentForUser,
  analyzeContentGeneral,
  getRecommendedContentIds,
  ContentAnalysis,
} from '../utils/content-analyzer';
import { generateAndSaveContent, GenerationOptions } from '../utils/graded-reader-generator';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface ReadingFilters {
  level?: string;
  topic?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ReadingWithProgress extends ReadingContent {
  userProgress?: UserReadingProgress | null;
  analysis?: ContentAnalysis | null;
}

export interface ReadingStats {
  totalContent: number;
  byLevel: { level: string; count: number }[];
  byTopic: { topic: string; count: number }[];
  totalWordsRead: number;
  completedCount: number;
}

// ═══════════════════════════════════════════════════════════════
// Reading Service
// ═══════════════════════════════════════════════════════════════

export class ReadingService {
  /**
   * Get reading content with filters and pagination
   */
  async getContent(filters: ReadingFilters): Promise<{ items: ReadingContent[]; total: number }> {
    const where: any = { isPublished: true };

    if (filters.level) {
      where.level = filters.level.toUpperCase();
    }
    if (filters.topic) {
      where.topic = { contains: filters.topic, mode: 'insensitive' };
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { summary: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.readingContent.findMany({
        where,
        take: filters.limit || 20,
        skip: filters.offset || 0,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.readingContent.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Get single reading content by ID
   */
  async getById(id: string): Promise<ReadingContent | null> {
    return prisma.readingContent.findUnique({ where: { id } });
  }

  /**
   * Get reading content with user-specific analysis
   */
  async getWithAnalysis(id: string, userId: string): Promise<ReadingWithProgress | null> {
    const content = await prisma.readingContent.findUnique({
      where: { id },
      include: {
        progress: {
          where: { userId },
          take: 1,
        },
      },
    });

    if (!content) return null;

    const analysis = await analyzeContentForUser(content.content, userId);

    return {
      ...content,
      userProgress: content.progress[0] || null,
      analysis,
    };
  }

  /**
   * Get recommended content for user based on i+1 principle
   */
  async getRecommended(userId: string, limit: number = 10): Promise<ReadingContent[]> {
    const recommendedIds = await getRecommendedContentIds(userId, limit);

    if (recommendedIds.length === 0) {
      // Fall back to newest content if no recommendations
      return prisma.readingContent.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    }

    const content = await prisma.readingContent.findMany({
      where: {
        id: { in: recommendedIds },
        isPublished: true,
      },
    });

    // Maintain recommendation order
    return recommendedIds
      .map(id => content.find(c => c.id === id))
      .filter((c): c is ReadingContent => c !== undefined);
  }

  /**
   * Get featured content
   */
  async getFeatured(limit: number = 5): Promise<ReadingContent[]> {
    return prisma.readingContent.findMany({
      where: {
        isPublished: true,
        isFeatured: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get reading statistics
   */
  async getStats(): Promise<ReadingStats> {
    const [total, byLevel, byTopic] = await Promise.all([
      prisma.readingContent.count({ where: { isPublished: true } }),
      prisma.readingContent.groupBy({
        by: ['level'],
        where: { isPublished: true },
        _count: true,
        orderBy: { level: 'asc' },
      }),
      prisma.readingContent.groupBy({
        by: ['topic'],
        where: { isPublished: true, topic: { not: null } },
        _count: true,
        orderBy: { _count: { topic: 'desc' } },
        take: 20,
      }),
    ]);

    return {
      totalContent: total,
      byLevel: byLevel.map(l => ({ level: l.level, count: l._count })),
      byTopic: byTopic
        .filter(t => t.topic !== null)
        .map(t => ({ topic: t.topic!, count: t._count })),
      totalWordsRead: 0, // Would need to aggregate from progress
      completedCount: 0,
    };
  }

  /**
   * Get available levels
   */
  async getLevels(): Promise<string[]> {
    const result = await prisma.readingContent.findMany({
      where: { isPublished: true },
      distinct: ['level'],
      select: { level: true },
      orderBy: { level: 'asc' },
    });
    return result.map(r => r.level);
  }

  /**
   * Get available topics
   */
  async getTopics(level?: string): Promise<string[]> {
    const where: any = { isPublished: true, topic: { not: null } };
    if (level) {
      where.level = level.toUpperCase();
    }

    const result = await prisma.readingContent.findMany({
      where,
      distinct: ['topic'],
      select: { topic: true },
      orderBy: { topic: 'asc' },
    });

    return result.map(r => r.topic).filter((t): t is string => t !== null);
  }

  // ═══════════════════════════════════════════════════════════════
  // User Progress Methods
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get or create user progress for content
   */
  async getOrCreateProgress(userId: string, contentId: string): Promise<UserReadingProgress> {
    let progress = await prisma.userReadingProgress.findUnique({
      where: { userId_contentId: { userId, contentId } },
    });

    if (!progress) {
      progress = await prisma.userReadingProgress.create({
        data: {
          userId,
          contentId,
          status: 'not_started',
        },
      });
    }

    return progress;
  }

  /**
   * Start reading content
   */
  async startReading(userId: string, contentId: string): Promise<UserReadingProgress> {
    return prisma.userReadingProgress.upsert({
      where: { userId_contentId: { userId, contentId } },
      update: {
        status: 'in_progress',
        startedAt: new Date(),
      },
      create: {
        userId,
        contentId,
        status: 'in_progress',
        startedAt: new Date(),
      },
    });
  }

  /**
   * Update reading progress
   */
  async updateProgress(
    userId: string,
    contentId: string,
    data: {
      progressPercent?: number;
      lastPosition?: number;
      wordsRead?: number;
      totalReadTime?: number;
      wordsLookedUp?: string[];
    }
  ): Promise<UserReadingProgress> {
    const updateData: any = {};

    if (data.progressPercent !== undefined) {
      updateData.progressPercent = data.progressPercent;
      if (data.progressPercent >= 100) {
        updateData.status = 'completed';
        updateData.completedAt = new Date();
      } else if (data.progressPercent > 0) {
        updateData.status = 'in_progress';
      }
    }
    if (data.lastPosition !== undefined) {
      updateData.lastPosition = data.lastPosition;
    }
    if (data.wordsRead !== undefined) {
      updateData.wordsRead = data.wordsRead;
    }
    if (data.totalReadTime !== undefined) {
      updateData.totalReadTime = data.totalReadTime;
    }
    if (data.wordsLookedUp) {
      // Append to existing array
      const current = await prisma.userReadingProgress.findUnique({
        where: { userId_contentId: { userId, contentId } },
        select: { wordsLookedUp: true },
      });
      const existing = current?.wordsLookedUp || [];
      const merged = [...new Set([...existing, ...data.wordsLookedUp])];
      updateData.wordsLookedUp = merged;
      updateData.newWordsFound = merged.length;
    }

    return prisma.userReadingProgress.update({
      where: { userId_contentId: { userId, contentId } },
      data: updateData,
    });
  }

  /**
   * Mark content as completed
   */
  async completeReading(
    userId: string,
    contentId: string,
    rating?: number
  ): Promise<UserReadingProgress> {
    return prisma.userReadingProgress.update({
      where: { userId_contentId: { userId, contentId } },
      data: {
        status: 'completed',
        progressPercent: 100,
        completedAt: new Date(),
        rating,
      },
    });
  }

  /**
   * Get user's reading history
   */
  async getUserHistory(
    userId: string,
    status?: 'not_started' | 'in_progress' | 'completed'
  ): Promise<Array<UserReadingProgress & { content: ReadingContent }>> {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return prisma.userReadingProgress.findMany({
      where,
      include: { content: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Get user's reading statistics
   */
  async getUserStats(userId: string): Promise<{
    totalRead: number;
    completed: number;
    inProgress: number;
    totalWords: number;
    totalTime: number;
    wordsLearned: number;
  }> {
    const progress = await prisma.userReadingProgress.findMany({
      where: { userId },
      select: {
        status: true,
        wordsRead: true,
        totalReadTime: true,
        newWordsFound: true,
      },
    });

    return {
      totalRead: progress.length,
      completed: progress.filter(p => p.status === 'completed').length,
      inProgress: progress.filter(p => p.status === 'in_progress').length,
      totalWords: progress.reduce((sum, p) => sum + p.wordsRead, 0),
      totalTime: progress.reduce((sum, p) => sum + p.totalReadTime, 0),
      wordsLearned: progress.reduce((sum, p) => sum + p.newWordsFound, 0),
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Content Management
  // ═══════════════════════════════════════════════════════════════

  /**
   * Generate new content using AI
   */
  async generateContent(options: GenerationOptions): Promise<string> {
    return generateAndSaveContent(options);
  }

  /**
   * Create content manually
   */
  async createContent(data: {
    title: string;
    content: string;
    summary?: string;
    level: string;
    topic?: string;
    source?: string;
    author?: string;
    imageUrl?: string;
  }): Promise<ReadingContent> {
    // Analyze content
    const analysis = await analyzeContentGeneral(data.content);

    return prisma.readingContent.create({
      data: {
        title: data.title,
        content: data.content,
        summary: data.summary,
        level: data.level.toUpperCase(),
        topic: data.topic,
        source: data.source,
        author: data.author,
        imageUrl: data.imageUrl,
        wordCount: analysis.totalWords,
        uniqueWords: analysis.uniqueWords,
        vocabularyList: analysis.vocabularyList,
        difficultyScore: analysis.difficultyScore,
        estimatedTime: analysis.estimatedReadingTime,
        isPublished: true,
      },
    });
  }

  /**
   * Delete content
   */
  async deleteContent(id: string): Promise<boolean> {
    try {
      await prisma.readingContent.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Seed sample reading content
   */
  async seedContent(): Promise<number> {
    const sampleContent = [
      {
        title: 'Meine Familie',
        content: 'Ich habe eine große Familie. Mein Vater heißt Thomas und meine Mutter heißt Maria. Ich habe zwei Geschwister: einen Bruder und eine Schwester. Mein Bruder ist älter als ich. Er ist zwanzig Jahre alt. Meine Schwester ist jünger. Sie ist zehn Jahre alt. Wir wohnen zusammen in einem Haus. Am Wochenende essen wir immer zusammen. Das ist schön.',
        summary: 'Eine einfache Geschichte über eine Familie.',
        level: 'A1',
        topic: 'Familie',
        wordCount: 67,
        uniqueWords: 45,
        difficultyScore: 1,
        estimatedTime: 120,
      },
      {
        title: 'Ein Tag im Park',
        content: 'Heute ist Sonntag. Das Wetter ist schön. Die Sonne scheint und es ist warm. Ich gehe in den Park. Im Park gibt es viele Bäume und Blumen. Die Vögel singen. Kinder spielen auf dem Spielplatz. Einige Leute joggen. Andere lesen ein Buch auf einer Bank. Ich kaufe ein Eis und setze mich auf das Gras. Der Park ist ein schöner Ort.',
        summary: 'Ein entspannter Tag im Park.',
        level: 'A1',
        topic: 'Freizeit',
        wordCount: 74,
        uniqueWords: 52,
        difficultyScore: 1,
        estimatedTime: 150,
      },
      {
        title: 'Im Restaurant',
        content: 'Gestern bin ich mit meiner Freundin ins Restaurant gegangen. Das Restaurant war sehr gemütlich. Der Kellner war freundlich und hat uns die Speisekarte gebracht. Ich habe eine Suppe als Vorspeise bestellt. Als Hauptgericht habe ich Schnitzel mit Kartoffeln gewählt. Meine Freundin hat Pasta gegessen. Zum Nachtisch haben wir Schokoladenkuchen geteilt. Das Essen war lecker und nicht zu teuer. Wir kommen bestimmt wieder.',
        summary: 'Ein Besuch in einem Restaurant mit einer Freundin.',
        level: 'A2',
        topic: 'Essen',
        wordCount: 78,
        uniqueWords: 58,
        difficultyScore: 2,
        estimatedTime: 180,
      },
      {
        title: 'Mein Beruf',
        content: 'Ich arbeite als Softwareentwickler bei einer großen Firma in Berlin. Jeden Tag fahre ich mit der U-Bahn zur Arbeit. Die Fahrt dauert etwa 30 Minuten. Im Büro arbeite ich meistens am Computer. Ich schreibe Programme und löse technische Probleme. Die Arbeit macht mir Spaß, weil sie kreativ und abwechslungsreich ist. Manchmal arbeite ich auch von zu Hause aus. Das nennt man Homeoffice. Meine Kollegen sind nett und wir verstehen uns gut.',
        summary: 'Ein Tag im Leben eines Softwareentwicklers.',
        level: 'B1',
        topic: 'Arbeit',
        wordCount: 89,
        uniqueWords: 68,
        difficultyScore: 3,
        estimatedTime: 240,
      },
      {
        title: 'Umweltschutz im Alltag',
        content: 'Der Klimawandel ist eines der größten Probleme unserer Zeit. Jeder von uns kann etwas tun, um die Umwelt zu schützen. Im Alltag gibt es viele Möglichkeiten: Wir können weniger Plastik verwenden, öfter mit dem Fahrrad fahren und Energie sparen. Auch das Recycling ist wichtig. Wenn wir Müll trennen, können viele Materialien wiederverwendet werden. Außerdem sollten wir regionale Produkte kaufen, um lange Transportwege zu vermeiden. Kleine Änderungen im Alltag können einen großen Unterschied machen.',
        summary: 'Tipps für umweltfreundliches Verhalten im Alltag.',
        level: 'B1',
        topic: 'Umwelt',
        wordCount: 95,
        uniqueWords: 72,
        difficultyScore: 3,
        estimatedTime: 300,
      },
    ];

    let count = 0;
    for (const content of sampleContent) {
      const exists = await prisma.readingContent.findFirst({
        where: { title: content.title },
      });

      if (!exists) {
        await prisma.readingContent.create({
          data: {
            ...content,
            vocabularyList: [],
            isPublished: true,
            isFeatured: count < 2,
          },
        });
        count++;
      }
    }

    return count;
  }
}
