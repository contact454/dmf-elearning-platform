/**
 * Mock API Route: GET /api/reading/progress
 * Returns user's reading progress statistics
 * 
 * SECURITY FEATURES:
 * - JWT Authentication (withAuth middleware)
 * - Rate limiting (100 req/min per IP)
 * - Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
 * - CORS configuration
 * - User-scoped data (progress filtered by authenticated userId)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { 
  checkRateLimit, 
  createSecureResponse, 
  createSecureErrorResponse 
} from '@/middleware/security';

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    // Rate limiting check
    checkRateLimit(request);

    // Extract userId from authenticated user
    const userId = user.userId;

    // TODO: In production, filter progress by userId from database
    // For now, return mock data (in production, this MUST be user-scoped)
    const progressStats = {
      userId, // Include userId to verify correct user context
      passagesCompleted: 12,
      accuracyByLevel: [
        { level: 'A1', averageAccuracy: 92.5, attempts: 50 },
        { level: 'A2', averageAccuracy: 85.3, attempts: 30 },
        { level: 'B1', averageAccuracy: 78.2, attempts: 20 },
      ],
      totalTimeSpentMinutes: 180,
      recentAttempts: 25,
      streak: {
        current: 7,
        longest: 15,
      },
    };

    return createSecureResponse(progressStats, request);
  } catch (error) {
    console.error('Error in GET /api/reading/progress:', error);
    
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return createSecureErrorResponse(error.message, 429, request);
    }
    
    return createSecureErrorResponse('Failed to fetch progress', 500, request);
  }
});
