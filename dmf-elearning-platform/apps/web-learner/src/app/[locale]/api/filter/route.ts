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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.getAll('level');
    const module = searchParams.get('module') || undefined;
    const difficulty = searchParams.get('difficulty');
    const topic = searchParams.get('topic') || undefined;
    const category = searchParams.get('category') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const results: any = {
      filters: { level, module, difficulty, topic, category },
      total: 0,
      data: {},
    };

    if (!module || module === 'vocabulary') {
      const vocabWhere: any = {
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

    if (!module || module === 'reading') {
      const difficultyFilter = difficulty ? parseInt(difficulty as string) : undefined;

      const readingWhere: any = {
        isPublished: true,
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

    if (!module || module === 'listening') {
      const difficultyFilter = difficulty ? parseInt(difficulty as string) : undefined;

      const listeningWhere: any = {
        isPublished: true,
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

    if (!module || module === 'speaking') {
      const difficultyFilter = difficulty ? parseInt(difficulty as string) : undefined;

      const speakingWhere: any = {
        isPublished: true,
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

    if (!module || module === 'writing') {
      const difficultyFilter = difficulty ? parseInt(difficulty as string) : undefined;

      const writingWhere: any = {
        isPublished: true,
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
    console.error('Filter API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Filter failed',
      },
      { status: 500 }
    );
  }
}
