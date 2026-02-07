import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
// import PDFDocument from 'pdfkit';

// const prisma = new PrismaClient();

/**
 * PDF Export API Route
 * 
 * TODO: This endpoint is temporarily disabled pending proper Prisma schema setup.
 * See analytics/charts/route.ts for more details.
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: 'PDF export endpoint temporarily disabled - pending Prisma schema setup',
    message: 'Please use the web dashboard to view your analytics'
  }, { status: 501 });
}
