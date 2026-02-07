import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

/**
 * Analytics Charts API Route
 * 
 * TODO: This endpoint is temporarily disabled pending proper Prisma schema setup.
 * The web-learner app needs to either:
 * 1. Create its own Prisma schema with the required tables
 * 2. Connect to a backend analytics service via API
 * 3. Use mock data for development
 * 
 * Required tables for full functionality:
 * - userVocabularyProgress
 * - speakingAttempt
 * - writingSubmission
 * - listeningSession
 * - readingSession
 * - lessonCompletion
 * - userAchievement
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chartType = searchParams.get('type');
  
  // Return mock data for development/testing
  return NextResponse.json({ 
    message: 'Analytics endpoint temporarily disabled - pending Prisma schema setup',
    type: chartType,
    mockData: {
      labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
      datasets: [{
        label: 'Sample Data',
        data: [0, 0, 0, 0, 0]
      }]
    }
  }, { status: 200 });
}
