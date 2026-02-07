import { NextRequest, NextResponse } from 'next/server';

/**
 * Analytics API Route - Temporarily Disabled
 * 
 * TODO: This endpoint requires proper Prisma schema setup.
 * See analytics/charts/route.ts for implementation details.
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Analytics endpoint temporarily disabled - pending Prisma schema setup',
    endpoint: 'system-metrics'
  }, { status: 501 });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
