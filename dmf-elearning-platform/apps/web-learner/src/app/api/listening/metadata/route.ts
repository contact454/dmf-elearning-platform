// GET /api/listening/metadata
// Fetch metadata about listening exercises (counts, topics, levels, etc.)

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/middleware/auth';

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(request.url);
    
    // Use authenticated userId from JWT token - NEVER from query parameter
    const userId = user.userId;

    // Get counts by level
    const levelCounts = await prisma.listeningExercise.groupBy({
      by: ['cefrLevel'],
      where: { status: 'PUBLISHED' },
      _count: {
        id: true,
      },
    });

    // Get counts by type
    const typeCounts = await prisma.listeningExercise.groupBy({
      by: ['exerciseType'],
      where: { status: 'PUBLISHED' },
      _count: {
        id: true,
      },
    });

    // Get unique topics
    const exercises = await prisma.listeningExercise.findMany({
      where: { status: 'PUBLISHED' },
      select: { topic: true },
      distinct: ['topic'],
    });
    const topics = exercises
      .map(e => e.topic)
      .filter((t): t is string => t !== null);

    // Total exercises
    const totalExercises = await prisma.listeningExercise.count({
      where: { status: 'PUBLISHED' },
    });

    // User-specific stats (always fetch for authenticated user)
    let userStats = null;
    const [totalAttempts, masteredCount, learningCount, reviewingCount] = await Promise.all([
      prisma.listeningAttempt.count({
        where: { userId },
      }),
      prisma.listeningProgress.count({
        where: { userId, status: 'mastered' },
      }),
      prisma.listeningProgress.count({
        where: { userId, status: 'learning' },
      }),
      prisma.listeningProgress.count({
        where: { userId, status: 'reviewing' },
      }),
    ]);

    const avgScore = await prisma.listeningAttempt.aggregate({
      where: { userId },
      _avg: {
        score: true,
        accuracy: true,
      },
    });

    userStats = {
      totalAttempts,
      masteredCount,
      learningCount,
      reviewingCount,
      averageScore: avgScore._avg.score || 0,
      averageAccuracy: avgScore._avg.accuracy || 0,
    };

    // Format response
    const metadata = {
      total: totalExercises,
      byLevel: levelCounts.reduce((acc, item) => {
        acc[item.cefrLevel] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      byType: typeCounts.reduce((acc, item) => {
        acc[item.exerciseType] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      topics,
      userStats,
    };

    return NextResponse.json({
      success: true,
      data: metadata,
    });

  } catch (error) {
    console.error('Error fetching listening metadata:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch metadata',
      },
      { status: 500 }
    );
  }
});
