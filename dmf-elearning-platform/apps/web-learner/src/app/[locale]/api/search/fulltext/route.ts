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
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const level = searchParams.getAll('level');
    const topic = searchParams.get('topic') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const vocabWhere: any = {
      ...(query && {
        OR: [
          { word: { search: query.split(' ').join(' & ') } },
          { meaning_vi: { search: query.split(' ').join(' & ') } },
          { example_de: { search: query.split(' ').join(' & ') } },
          { word: { contains: query, mode: 'insensitive' } },
          { meaning_vi: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(level.length > 0 && { level: { in: level } }),
      ...(topic && { topic }),
    };

    const readingWhere: any = {
      isPublished: true,
      ...(query && {
        OR: [
          { title: { search: query.split(' ').join(' & ') } },
          { content: { search: query.split(' ').join(' & ') } },
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(level.length > 0 && { level: { in: level } }),
      ...(topic && { topic }),
    };

    const listeningWhere: any = {
      isPublished: true,
      ...(query && {
        OR: [
          { title: { search: query.split(' ').join(' & ') } },
          { transcript: { search: query.split(' ').join(' & ') } },
          { title: { contains: query, mode: 'insensitive' } },
          { transcript: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(level.length > 0 && { level: { in: level } }),
      ...(topic && { topic }),
    };

    const [vocabulary, reading, listening] = await Promise.all([
      prisma.vocabulary.findMany({
        where: vocabWhere,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.readingContent.findMany({
        where: readingWhere,
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          summary: true,
          level: true,
          topic: true,
          wordCount: true,
          difficultyScore: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.listeningContent.findMany({
        where: listeningWhere,
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          description: true,
          level: true,
          topic: true,
          duration: true,
          difficultyScore: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const [vocabCount, readingCount, listeningCount] = await Promise.all([
      prisma.vocabulary.count({ where: vocabWhere }),
      prisma.readingContent.count({ where: readingWhere }),
      prisma.listeningContent.count({ where: listeningWhere }),
    ]);

    return NextResponse.json({
      success: true,
      query,
      filters: { level, topic },
      total: vocabCount + readingCount + listeningCount,
      results: {
        vocabulary: {
          total: vocabCount,
          items: vocabulary,
        },
        reading: {
          total: readingCount,
          items: reading,
        },
        listening: {
          total: listeningCount,
          items: listening,
        },
      },
    });
  } catch (error: any) {
    console.error('Full-text Search API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Full-text search failed',
      },
      { status: 500 }
    );
  }
}
