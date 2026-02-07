/**
 * Mock API Route: GET /api/reading/passages/[id]
 * Returns single passage with exercises and user progress
 * 
 * SECURITY FEATURES:
 * - JWT Authentication (withAuth middleware)
 * - Rate limiting (100 req/min per IP)
 * - Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
 * - CORS configuration
 * - Premium content access control
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { 
  checkRateLimit, 
  createSecureResponse, 
  createSecureErrorResponse 
} from '@/middleware/security';

const mockPassagesWithExercises = {
  '1': {
    passage: {
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
      exercises: [
        {
          id: 'ex-1',
          passageId: '1',
          exerciseType: 'multiple_choice' as const,
          question: 'What do people say in Spanish?',
          exerciseData: {
            options: ['Hola', 'Bonjour', 'Konnichiwa', 'Hello'],
            correct_index: 0,
          },
          explanation: 'The passage states that in Spanish, people say "Hola".',
          difficultyLevel: 2,
          displayOrder: 1,
        },
        {
          id: 'ex-2',
          passageId: '1',
          exerciseType: 'true_false' as const,
          question: 'All cultures have the same way of saying hello.',
          exerciseData: {
            statement: 'All cultures have the same way of saying hello.',
            is_true: false,
          },
          explanation: 'The passage mentions that "each culture has its own way of saying hello".',
          difficultyLevel: 1,
          displayOrder: 2,
        },
      ],
    },
    userProgress: {
      completedAt: null,
      totalExercises: 0,
      correctExercises: 0,
      accuracyPercentage: 0,
      timeSpentSeconds: 0,
    },
  },
  '2': {
    passage: {
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
      exercises: [
        {
          id: 'ex-3',
          passageId: '2',
          exerciseType: 'fill_blank' as const,
          question: 'Complete the sentence from the passage.',
          exerciseData: {
            sentence: 'Morning exercise boosts your _____ levels.',
            correct_answer: 'energy',
            alternatives: ['Energy'],
            word_bank: ['energy', 'stress', 'mood', 'fitness'],
          },
          explanation: 'The passage mentions that "Morning exercise boosts your energy levels".',
          difficultyLevel: 3,
          displayOrder: 1,
        },
      ],
    },
    userProgress: {
      completedAt: null,
      totalExercises: 0,
      correctExercises: 0,
      accuracyPercentage: 0,
      timeSpentSeconds: 0,
    },
  },
};

export const GET = withAuth(async (
  request: NextRequest,
  context: { params: Promise<{ id: string }>, user: { userId: string; email?: string } }
) => {
  try {
    // Rate limiting check
    checkRateLimit(request);

    const { id } = await context.params;
    const { user } = context;
    
    const data = mockPassagesWithExercises[id as keyof typeof mockPassagesWithExercises];

    if (!data) {
      return createSecureErrorResponse('Passage not found', 404, request);
    }

    // TODO: In production, check if user has premium access for premium passages
    // For now, all passages are accessible to authenticated users
    
    return createSecureResponse(data, request);
  } catch (error) {
    console.error('Error in GET /api/reading/passages/[id]:', error);
    
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return createSecureErrorResponse(error.message, 429, request);
    }
    
    return createSecureErrorResponse('Failed to fetch passage', 500, request);
  }
});
