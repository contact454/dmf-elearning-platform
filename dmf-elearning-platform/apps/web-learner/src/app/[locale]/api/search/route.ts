import { NextRequest, NextResponse } from 'next/server';

// Mock Prisma client - replace with actual learning service client
const prisma = {
  vocabulary: {
    findMany: async (params: any) => [],
    count: async (params: any) => 0,
  },
  readingContent: {
    findMany: async (params: any) => [],
    count: async (params: any) => 0,
  },
  listeningContent: {
    findMany: async (params: any) => [],
    count: async (params: any) => 0,
  },
  speakingPrompt: {
    findMany: async (params: any) => [],
    count: async (params: any) => 0,
  },
  writingPrompt: {
    findMany: async (params: any) => [],
    count: async (params: any) => 0,
  },
};

interface SearchFilters {
  level?: string | string[];
  module?: string;
  difficulty?: number | string;
  topic?: string;
  category?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const level = searchParams.getAll('level');
    const module = searchParams.get('module') || undefined;
    const difficulty = searchParams.get('difficulty');
    const topic = searchParams.get('topic') || undefined;
    const category = searchParams.get('category') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const results: any = {
      query,
      filters: { level, module, difficulty, topic, category },
      total: 0,
      data: {},
    };

    if (type === 'all' || type === 'vocabulary') {
      const vocabWhere: any = {
        ...(query && {
          OR: [
            { word: { contains: query, mode: 'insensitive' } },
            { meaning_vi: { contains: query, mode: 'insensitive' } },
            { example_de: { contains: query, mode: 'insensitive' } },
            { pos: { contains: query, mode: 'insensitive' } },
          ],
        }),
        ...(level.length > 0 && { level: { in: level } }),
        ...(topic && { topic }),
      };

      const vocabulary = await prisma.vocabulary.findMany({
        where: vocabWhere,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      const vocabCount = await prisma.vocabulary.count({ where: vocabWhere });

      results.data.vocabulary = vocabulary;
      results.total += vocabCount;
    }

    if (type === 'all' || type === 'reading') {
      const difficultyFilter = difficulty ? parseInt(difficulty as string) : undefined;

      const readingWhere: any = {
        isPublished: true,
        ...(query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { summary: { contains: query, mode: 'insensitive' } },
          ],
        }),
        ...(level.length > 0 && { level: { in: level } }),
        ...(topic && { topic }),
        ...(difficultyFilter && {
          difficultyScore: { gte: (difficultyFilter - 1) * 20, lte: difficultyFilter * 20 },
        }),
      };

      const reading = await prisma.readingContent.findMany({
        where: readingWhere,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      const readingCount = await prisma.readingContent.count({ where: readingWhere });

      results.data.reading = reading;
      results.total += readingCount;
    }

    if (type === 'all' || type === 'listening') {
      const difficultyFilter = difficulty ? parseInt(difficulty as string) : undefined;

      const listeningWhere: any = {
        isPublished: true,
        ...(query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { transcript: { contains: query, mode: 'insensitive' } },
          ],
        }),
        ...(level.length > 0 && { level: { in: level } }),
        ...(topic && { topic }),
        ...(difficultyFilter && {
          difficultyScore: { gte: (difficultyFilter - 1) * 20, lte: difficultyFilter * 20 },
        }),
      };

      const listening = await prisma.listeningContent.findMany({
        where: listeningWhere,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      const listeningCount = await prisma.listeningContent.count({ where: listeningWhere });

      results.data.listening = listening;
      results.total += listeningCount;
    }

    if (type === 'all' || type === 'speaking') {
      const difficultyFilter = difficulty ? parseInt(difficulty as string) : undefined;

      const speakingWhere: any = {
        isPublished: true,
        ...(query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { promptText: { contains: query, mode: 'insensitive' } },
          ],
        }),
        ...(level.length > 0 && { level: { in: level } }),
        ...(topic && { topic }),
        ...(category && { category }),
        ...(difficultyFilter && { difficulty: difficultyFilter }),
      };

      const speaking = await prisma.speakingPrompt.findMany({
        where: speakingWhere,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      const speakingCount = await prisma.speakingPrompt.count({ where: speakingWhere });

      results.data.speaking = speaking;
      results.total += speakingCount;
    }

    if (type === 'all' || type === 'writing') {
      const difficultyFilter = difficulty ? parseInt(difficulty as string) : undefined;

      const writingWhere: any = {
        isPublished: true,
        ...(query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { promptText: { contains: query, mode: 'insensitive' } },
          ],
        }),
        ...(level.length > 0 && { level: { in: level } }),
        ...(topic && { topic }),
        ...(category && { category }),
        ...(difficultyFilter && { difficulty: difficultyFilter }),
      };

      const writing = await prisma.writingPrompt.findMany({
        where: writingWhere,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      const writingCount = await prisma.writingPrompt.count({ where: writingWhere });

      results.data.writing = writing;
      results.total += writingCount;
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Search failed',
      },
      { status: 500 }
    );
  }
}
