import { NextRequest, NextResponse } from 'next/server';

// Mock types for search results
type VocabularyItem = {
  id: string;
  word: string;
  meaning_vi: string;
  level: string;
  topic: string;
  createdAt: Date;
};

type ReadingItem = {
  id: string;
  title: string;
  summary: string;
  level: string;
  topic: string;
  difficultyScore: number;
  createdAt: Date;
};

type ListeningItem = {
  id: string;
  title: string;
  description: string;
  level: string;
  topic: string;
  difficultyScore: number;
  duration: number;
  createdAt: Date;
};

type SpeakingItem = {
  id: string;
  title: string;
  description: string;
  level: string;
  topic: string;
  category: string;
  difficulty: number;
  createdAt: Date;
};

type WritingItem = {
  id: string;
  title: string;
  description: string;
  level: string;
  topic: string;
  category: string;
  difficulty: number;
  createdAt: Date;
};

// Mock Prisma client - replace with actual learning service client
const prisma = {
  vocabulary: {
    findMany: async (params: any): Promise<VocabularyItem[]> => [],
    count: async (params: any): Promise<number> => 0,
  },
  readingContent: {
    findMany: async (params: any): Promise<ReadingItem[]> => [],
    count: async (params: any): Promise<number> => 0,
  },
  listeningContent: {
    findMany: async (params: any): Promise<ListeningItem[]> => [],
    count: async (params: any): Promise<number> => 0,
  },
  speakingPrompt: {
    findMany: async (params: any): Promise<SpeakingItem[]> => [],
    count: async (params: any): Promise<number> => 0,
  },
  writingPrompt: {
    findMany: async (params: any): Promise<WritingItem[]> => [],
    count: async (params: any): Promise<number> => 0,
  },
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const level = searchParams.getAll('level');
    const module = searchParams.get('module') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const lessonResults: any[] = [];

    // Search Vocabulary as lessons
    if (!module || module === 'vocabulary') {
      const vocabWhere: any = {
        ...(query && {
          OR: [
            { word: { contains: query, mode: 'insensitive' } },
            { meaning_vi: { contains: query, mode: 'insensitive' } },
          ],
        }),
        ...(level.length > 0 && { level: { in: level } }),
      };

      const vocabulary = await prisma.vocabulary.findMany({
        where: vocabWhere,
        take: limit,
        skip: offset,
        select: {
          id: true,
          word: true,
          meaning_vi: true,
          level: true,
          topic: true,
          createdAt: true,
        },
      });

      lessonResults.push(
        ...vocabulary.map((v) => ({
          id: v.id,
          title: v.word,
          description: v.meaning_vi,
          level: v.level,
          module: 'vocabulary',
          topic: v.topic,
          createdAt: v.createdAt,
        }))
      );
    }

    // Search Reading Content as lessons
    if (!module || module === 'reading') {
      const readingWhere: any = {
        isPublished: true,
        ...(query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { summary: { contains: query, mode: 'insensitive' } },
          ],
        }),
        ...(level.length > 0 && { level: { in: level } }),
      };

      const reading = await prisma.readingContent.findMany({
        where: readingWhere,
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          summary: true,
          level: true,
          topic: true,
          difficultyScore: true,
          createdAt: true,
        },
      });

      lessonResults.push(
        ...reading.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.summary,
          level: r.level,
          module: 'reading',
          topic: r.topic,
          difficulty: Math.ceil(r.difficultyScore / 20),
          createdAt: r.createdAt,
        }))
      );
    }

    // Search Listening Content as lessons
    if (!module || module === 'listening') {
      const listeningWhere: any = {
        isPublished: true,
        ...(query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        }),
        ...(level.length > 0 && { level: { in: level } }),
      };

      const listening = await prisma.listeningContent.findMany({
        where: listeningWhere,
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          description: true,
          level: true,
          topic: true,
          difficultyScore: true,
          duration: true,
          createdAt: true,
        },
      });

      lessonResults.push(
        ...listening.map((l) => ({
          id: l.id,
          title: l.title,
          description: l.description,
          level: l.level,
          module: 'listening',
          topic: l.topic,
          difficulty: Math.ceil(l.difficultyScore / 20),
          duration: l.duration,
          createdAt: l.createdAt,
        }))
      );
    }

    // Search Speaking Prompts as lessons
    if (!module || module === 'speaking') {
      const speakingWhere: any = {
        isPublished: true,
        ...(query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        }),
        ...(level.length > 0 && { level: { in: level } }),
      };

      const speaking = await prisma.speakingPrompt.findMany({
        where: speakingWhere,
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          description: true,
          level: true,
          topic: true,
          category: true,
          difficulty: true,
          createdAt: true,
        },
      });

      lessonResults.push(
        ...speaking.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          level: s.level,
          module: 'speaking',
          topic: s.topic,
          category: s.category,
          difficulty: s.difficulty,
          createdAt: s.createdAt,
        }))
      );
    }

    // Search Writing Prompts as lessons
    if (!module || module === 'writing') {
      const writingWhere: any = {
        isPublished: true,
        ...(query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        }),
        ...(level.length > 0 && { level: { in: level } }),
      };

      const writing = await prisma.writingPrompt.findMany({
        where: writingWhere,
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          description: true,
          level: true,
          topic: true,
          category: true,
          difficulty: true,
          createdAt: true,
        },
      });

      lessonResults.push(
        ...writing.map((w) => ({
          id: w.id,
          title: w.title,
          description: w.description,
          level: w.level,
          module: 'writing',
          topic: w.topic,
          category: w.category,
          difficulty: w.difficulty,
          createdAt: w.createdAt,
        }))
      );
    }

    // Sort by createdAt descending
    lessonResults.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({
      success: true,
      total: lessonResults.length,
      lessons: lessonResults.slice(0, limit),
    });
  } catch (error: any) {
    console.error('Lessons Search API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Lessons search failed',
      },
      { status: 500 }
    );
  }
}
