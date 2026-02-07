/**
 * Mock API Route: GET /api/vocabulary/status
 * Returns vocabulary status (new/learning/known)
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock saved vocabulary (in production, this would query the database)
const savedVocabulary: Record<string, 'new' | 'learning' | 'known'> = {
  'hello': 'known',
  'greet': 'learning',
  'morning': 'learning',
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const word = searchParams.get('word')?.toLowerCase();

    if (!word) {
      return NextResponse.json(
        { error: 'Word parameter is required' },
        { status: 400 }
      );
    }

    const status = savedVocabulary[word] || null;

    return NextResponse.json({ status });
  } catch (error) {
    console.error('Error in GET /api/vocabulary/status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary status' },
      { status: 500 }
    );
  }
}
