/**
 * Mock API Route: GET /api/reading/passages
 * Returns list of reading passages with pagination
 * 
 * SECURITY FEATURES:
 * - JWT Authentication (withAuth middleware)
 * - Rate limiting (100 req/min per IP)
 * - Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
 * - CORS configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { 
  checkRateLimit, 
  createSecureResponse, 
  createSecureErrorResponse 
} from '@/middleware/security';

// Mock data for testing
const mockPassages = [
  {
    id: '1',
    title: 'Greetings Around the World',
    content: 'Hello is a common greeting in English. In Spanish, people say "Hola". French speakers use "Bonjour". In Japanese, the greeting is "Konnichiwa". Each culture has its own way of saying hello, but the meaning is the same: a friendly way to start a conversation.',
    cefrLevel: 'A1',
    topic: 'culture',
    wordCount: 61,
    estimatedReadingTimeMinutes: 1,
    difficultyScore: 1.5,
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'The Benefits of Morning Exercise',
    content: 'Starting your day with physical activity has numerous advantages. Morning exercise boosts your energy levels and improves mental clarity throughout the day. Studies show that people who exercise in the morning tend to be more consistent with their fitness routines. Additionally, morning workouts can enhance your mood and reduce stress before the day begins.',
    cefrLevel: 'B1',
    topic: 'health',
    wordCount: 68,
    estimatedReadingTimeMinutes: 1,
    difficultyScore: 4.2,
    isPremium: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Artificial Intelligence in Modern Business',
    content: 'Artificial intelligence is transforming the business landscape at an unprecedented pace. Companies are leveraging machine learning algorithms to optimize operations, predict customer behavior, and automate routine tasks. This technological revolution presents both opportunities and challenges. While AI can significantly enhance productivity and decision-making, organizations must also address ethical considerations and workforce adaptation.',
    cefrLevel: 'C1',
    topic: 'business',
    wordCount: 65,
    estimatedReadingTimeMinutes: 1,
    difficultyScore: 8.5,
    isPremium: true,
    createdAt: new Date().toISOString(),
  },
];

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    // Rate limiting check
    checkRateLimit(request);

    const searchParams = request.nextUrl.searchParams;
    const cefr = searchParams.get('cefr');
    const topic = searchParams.get('topic');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'difficulty_asc';

    // Filter passages
    let filteredPassages = [...mockPassages];

    if (cefr) {
      filteredPassages = filteredPassages.filter(p => p.cefrLevel === cefr);
    }

    if (topic) {
      filteredPassages = filteredPassages.filter(p => p.topic === topic);
    }

    // Sort passages
    if (sort === 'difficulty_asc') {
      filteredPassages.sort((a, b) => (a.difficultyScore || 0) - (b.difficultyScore || 0));
    } else if (sort === 'difficulty_desc') {
      filteredPassages.sort((a, b) => (b.difficultyScore || 0) - (a.difficultyScore || 0));
    } else if (sort === 'created_desc') {
      filteredPassages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPassages = filteredPassages.slice(startIndex, endIndex);

    return createSecureResponse({
      passages: paginatedPassages,
      pagination: {
        page,
        limit,
        total: filteredPassages.length,
        totalPages: Math.ceil(filteredPassages.length / limit),
      },
    }, request);
  } catch (error) {
    console.error('Error in GET /api/reading/passages:', error);
    
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return createSecureErrorResponse(error.message, 429, request);
    }
    
    return createSecureErrorResponse('Failed to fetch passages', 500, request);
  }
});
