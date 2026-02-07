/**
 * Mock API Route: POST /api/reading/submit
 * Submit exercise answer and get validation
 * 
 * SECURITY FEATURES:
 * - JWT Authentication (withAuth middleware)
 * - Rate limiting (100 req/min per IP)
 * - Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
 * - CORS configuration
 * - User-scoped data validation
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
    const { passageId, exerciseId, userAnswer, timeSpentSeconds } = body;

    // Extract userId from authenticated user (NEVER from request body!)
    const userId = user.userId;

    // Mock validation logic - Updated to match test exercise IDs
    const mockExercises: Record<string, any> = {
      // Legacy IDs (for backward compatibility)
      'ex-1': {
        type: 'multiple_choice',
        correctAnswer: { correct_index: 0 },
        explanation: 'The passage states that in Spanish, people say "Hola".',
      },
      'ex-2': {
        type: 'true_false',
        correctAnswer: { is_true: false },
        explanation: 'The passage mentions that "each culture has its own way of saying hello".',
      },
      'ex-3': {
        type: 'fill_blank',
        correctAnswer: { answer: 'energy' },
        alternatives: ['Energy'],
        explanation: 'The passage mentions that "Morning exercise boosts your energy levels".',
      },
      // New format IDs (matching test data)
      'ex-mc-1': {
        type: 'multiple_choice',
        correctAnswer: { correct_index: 0 },
        explanation: 'The passage states that in Spanish, people say "Hola".',
      },
      'ex-tf-1': {
        type: 'true_false',
        correctAnswer: { is_true: false },
        explanation: 'The passage mentions that "each culture has its own way of saying hello".',
      },
      'ex-fb-1': {
        type: 'fill_blank',
        correctAnswer: { answer: 'energy' },
        alternatives: ['Energy'],
        explanation: 'The passage mentions that "Morning exercise boosts your energy levels".',
      },
      'ex-seq-1': {
        type: 'sequencing',
        correctAnswer: { 
          correct_order: [0, 1, 2, 3] 
        },
        explanation: 'The steps should be in the order shown.',
      },
    };

    const exercise = mockExercises[exerciseId];

    if (!exercise) {
      return createSecureErrorResponse('Exercise not found', 404, request);
    }

    // Validate answer based on exercise type
    let isCorrect = false;
    let accuracyScore = 0;

    if (exercise.type === 'multiple_choice') {
      isCorrect = userAnswer.selected_index === exercise.correctAnswer.correct_index;
      accuracyScore = isCorrect ? 100 : 0;
    } else if (exercise.type === 'true_false') {
      isCorrect = userAnswer.answer === exercise.correctAnswer.is_true;
      accuracyScore = isCorrect ? 100 : 0;
    } else if (exercise.type === 'fill_blank') {
      const userAnswerLower = userAnswer.answer.toLowerCase().trim();
      const correctAnswerLower = exercise.correctAnswer.answer.toLowerCase();
      const alternatives = exercise.alternatives?.map((a: string) => a.toLowerCase()) || [];
      
      isCorrect = userAnswerLower === correctAnswerLower || alternatives.includes(userAnswerLower);
      
      // Calculate similarity for partial credit (simple implementation)
      if (!isCorrect) {
        const similarity = calculateSimilarity(userAnswerLower, correctAnswerLower);
        accuracyScore = Math.round(similarity * 100);
        isCorrect = accuracyScore >= 85;
      } else {
        accuracyScore = 100;
      }
    } else if (exercise.type === 'sequencing') {
      // Sequencing exercise: calculate partial credit based on correct positions
      const userOrder = userAnswer.order || [];
      const correctOrder = exercise.correctAnswer.correct_order;
      
      if (userOrder.length !== correctOrder.length) {
        isCorrect = false;
        accuracyScore = 0;
      } else {
        let correctPositions = 0;
        for (let i = 0; i < correctOrder.length; i++) {
          if (userOrder[i] === correctOrder[i]) {
            correctPositions++;
          }
        }
        accuracyScore = Math.round((correctPositions / correctOrder.length) * 100);
        isCorrect = accuracyScore === 100;
      }
    }

    const xpEarned = isCorrect ? 10 : 5; // 10 XP for correct, 5 XP for attempt

    return createSecureResponse({
      attemptId: `attempt-${Date.now()}`,
      isCorrect,
      accuracyScore,
      correctAnswer: exercise.correctAnswer,
      explanation: exercise.explanation,
      xpEarned,
    }, request);
  } catch (error) {
    console.error('Error in POST /api/reading/submit:', error);
    
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return createSecureErrorResponse(error.message, 429, request);
    }
    
    return createSecureErrorResponse('Failed to submit answer', 500, request);
  }
});

// Simple Levenshtein similarity (for demo purposes)
function calculateSimilarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1.0;
  
  const distance = levenshteinDistance(str1, str2);
  return (maxLen - distance) / maxLen;
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],
          dp[i][j - 1],
          dp[i - 1][j - 1]
        );
      }
    }
  }
  
  return dp[m][n];
}
