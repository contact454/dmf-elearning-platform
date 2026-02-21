// GET /api/listening/exercises
// Fetch listening exercises with optional filters

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/middleware/auth';

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const level = searchParams.get('level'); // A1, A2, B1, B2, C1, C2
    const type = searchParams.get('type'); // DICTATION, MULTIPLE_CHOICE, etc.
    const topic = searchParams.get('topic');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || 'PUBLISHED';

    // Build where clause
    const where: any = {
      status,
    };

    if (level) {
      where.cefrLevel = level;
    }

    if (type) {
      where.exerciseType = type;
    }

    if (topic) {
      where.topic = topic;
    }

    // Fetch exercises
    const [exercises, total] = await Promise.all([
      prisma.listeningExercise.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          audioUrl: true,
          audioDuration: true,
          exerciseType: true,
          cefrLevel: true,
          topic: true,
          tags: true,
          questionData: true,
          options: true,
          maxScore: true,
          playCount: true,
          avgScore: true,
          avgAccuracy: true,
          publishedAt: true,
          createdAt: true,
          // Don't send correctAnswer to client!
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.listeningExercise.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        exercises,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching listening exercises:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch listening exercises',
      },
      { status: 500 }
    );
  }
});
