/**
 * Adaptive Difficulty Adjustment Algorithm
 * 
 * Analyzes user performance on recent listening exercises
 * and recommends appropriate difficulty level (1-10)
 * 
 * Based on:
 * - Average accuracy score
 * - Average attempts per exercise
 * - Trend over time
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

/**
 * Calculate mode (most frequent value) of an array
 */
function mode(arr: number[]): number {
  if (arr.length === 0) return 1;
  
  const counts = new Map<number, number>();
  arr.forEach(n => counts.set(n, (counts.get(n) || 0) + 1));
  
  // Find max count
  const maxCount = Math.max(...counts.values());
  const modes = Array.from(counts.entries())
    .filter(([_, count]) => count === maxCount)
    .map(([value, _]) => value);
  
  // Return average of modes if multiple
  return Math.round(modes.reduce((sum, val) => sum + val, 0) / modes.length);
}

/**
 * Calculate adaptive difficulty based on recent performance
 * 
 * Algorithm:
 * - Analyze last 10 attempts (or fewer if less available)
 * - Calculate average accuracy and attempts per exercise
 * - Adjust difficulty based on performance thresholds
 * 
 * Adjustment rules:
 * - Avg accuracy > 90% AND avg attempts < 1.5 → +2 difficulty
 * - Avg accuracy > 80% AND avg attempts < 2 → +1 difficulty
 * - Avg accuracy < 50% OR avg attempts > 3 → -2 difficulty
 * - Avg accuracy < 70% OR avg attempts > 2.5 → -1 difficulty
 * - Otherwise → no change
 * 
 * Difficulty range: 1-10 (clamped)
 * 
 * @param userId - User ID to analyze
 * @returns Recommended difficulty level (1-10)
 */
export async function calculateAdaptiveDifficulty(userId: string): Promise<number> {
  try {
    // Fetch recent attempts (last 10)
    const recentAttempts = await prisma.dictationAttempt.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        exercise: {
          select: {
            difficulty: true,
          },
        },
      },
    });
    
    // No attempts yet → start at difficulty 1
    if (recentAttempts.length === 0) {
      return 1;
    }
    
    // Calculate average accuracy
    const totalAccuracy = recentAttempts.reduce((sum, a) => sum + (a.accuracy || 0), 0);
    const avgAccuracy = totalAccuracy / recentAttempts.length;
    
    // Calculate average attempts per exercise
    const uniqueExercises = new Set(recentAttempts.map(a => a.exerciseId));
    const avgAttempts = recentAttempts.length / uniqueExercises.size;
    
    // Get current difficulty (mode of recent exercises)
    const difficulties = recentAttempts.map(a => a.exercise.difficulty);
    const currentDifficulty = mode(difficulties);
    
    // Determine difficulty adjustment
    let difficultyDelta = 0;
    
    if (avgAccuracy > 90 && avgAttempts < 1.5) {
      difficultyDelta = +2; // Too easy → increase significantly
    } else if (avgAccuracy > 80 && avgAttempts < 2) {
      difficultyDelta = +1; // Slightly easy → increase
    } else if (avgAccuracy < 50 || avgAttempts > 3) {
      difficultyDelta = -2; // Too hard → decrease significantly
    } else if (avgAccuracy < 70 || avgAttempts > 2.5) {
      difficultyDelta = -1; // Slightly hard → decrease
    }
    // else: no change (performing at appropriate level)
    
    // Calculate new difficulty (clamped to 1-10)
    const newDifficulty = Math.max(1, Math.min(10, currentDifficulty + difficultyDelta));
    
    console.log('[difficulty-adjustment]', {
      userId,
      attemptsAnalyzed: recentAttempts.length,
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
      avgAttempts: Math.round(avgAttempts * 10) / 10,
      currentDifficulty,
      difficultyDelta,
      newDifficulty,
    });
    
    return newDifficulty;
  } catch (error) {
    console.error('[difficulty-adjustment] calculateAdaptiveDifficulty failed:', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    
    // Fallback to difficulty 1 on error
    return 1;
  }
}

/**
 * Get recommended exercises based on user's adaptive difficulty
 * 
 * Returns exercises at or near the recommended difficulty level
 * 
 * @param userId - User ID
 * @param limit - Maximum exercises to return (default: 5)
 * @returns Array of recommended exercises
 */
export async function getRecommendedExercises(
  userId: string,
  limit: number = 5
) {
  try {
    const recommendedDifficulty = await calculateAdaptiveDifficulty(userId);
    
    // Fetch exercises at recommended difficulty ±1
    const exercises = await prisma.dictationExercise.findMany({
      where: {
        difficulty: {
          gte: Math.max(1, recommendedDifficulty - 1),
          lte: Math.min(5, recommendedDifficulty + 1),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        content: {
          select: {
            id: true,
            title: true,
            level: true,
            audioUrl: true,
            duration: true,
          },
        },
      },
    });
    
    return {
      recommendedDifficulty,
      exercises,
    };
  } catch (error) {
    console.error('[difficulty-adjustment] getRecommendedExercises failed:', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error('Failed to get recommended exercises');
  }
}
