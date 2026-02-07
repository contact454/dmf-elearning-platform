/**
 * Mock API Route: POST /api/reading/vocabulary/save
 * Save word to user's vocabulary (Reading module integration)
 * 
 * SECURITY FEATURES:
 * - JWT Authentication (withAuth middleware)
 * - Rate limiting (100 req/min per IP)
 * - Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
 * - CORS configuration
 * - User-scoped data (vocabulary associated with authenticated userId)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { 
  checkRateLimit, 
  createSecureResponse, 
  createSecureErrorResponse 
} from '@/middleware/security';

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    // Rate limiting check
    checkRateLimit(request);

    const body = await request.json();
    const { word, passageId, context } = body;

    // Extract userId from authenticated user (NEVER from request body!)
    const userId = user.userId;

    if (!word) {
      return createSecureErrorResponse('Word is required', 400, request);
    }

    // Mock response (in production, this would save to database with userId)
    const mockDefinitions: Record<string, any> = {
      'hello': {
        definition: 'A greeting or expression of goodwill used when meeting or addressing someone.',
        translationVi: 'Xin chào',
        pronunciation: '/həˈləʊ/',
      },
      'greet': {
        definition: 'To address with expressions of goodwill or kindness upon meeting.',
        translationVi: 'Chào hỏi',
        pronunciation: '/ɡriːt/',
      },
      'morning': {
        definition: 'The period of time between midnight and noon, especially from sunrise to noon.',
        translationVi: 'Buổi sáng',
        pronunciation: '/ˈmɔːrnɪŋ/',
      },
      'exercise': {
        definition: 'Physical activity that is done to become stronger and healthier.',
        translationVi: 'Tập thể dục',
        pronunciation: '/ˈeksəsaɪz/',
      },
      'energy': {
        definition: 'The strength and vitality required for sustained physical or mental activity.',
        translationVi: 'Năng lượng',
        pronunciation: '/ˈenərdʒi/',
      },
    };

    const wordLower = word.toLowerCase();
    const definition = mockDefinitions[wordLower] || {
      definition: `Definition for "${word}"`,
      translationVi: null,
      pronunciation: null,
    };

    // Calculate next review date (1 day from now for new words)
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + 1);

    return createSecureResponse({
      message: 'Word saved successfully',
      vocabulary: {
        id: `vocab-${Date.now()}`,
        userId, // Associate with authenticated user
        word: wordLower,
        definition: definition.definition,
        translationVi: definition.translationVi,
        pronunciation: definition.pronunciation,
        exampleSentence: context || null,
        status: 'new',
        nextReviewAt: nextReviewAt.toISOString(),
      },
    }, request);
  } catch (error) {
    console.error('Error in POST /api/reading/vocabulary/save:', error);
    
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return createSecureErrorResponse(error.message, 429, request);
    }
    
    return createSecureErrorResponse('Failed to save vocabulary', 500, request);
  }
});
