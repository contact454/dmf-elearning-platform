import { NextRequest, NextResponse } from 'next/server';

/**
 * Gamification API Route - Temporarily Disabled
 * 
 * TODO: Connect to backend gamification service or implement Prisma schema.
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Gamification endpoint temporarily disabled - connect to backend service',
    endpoint: 'leaderboard'
  }, { status: 501 });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
