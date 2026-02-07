/**
 * Listening-Specific SRS (Spaced Repetition System) Algorithm
 * Based on SM-2 with listening-specific quality rating
 * 
 * Key differences from vocabulary SRS:
 * - Partial credit possible (accuracy_score 0-100)
 * - Time spent matters (faster = better mastery)
 * - Multiple attempts per exercise tracked
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

export type QualityRating = 0 | 1 | 2 | 3 | 4 | 5;

export interface ListeningProgress {
  ease_factor: number;
  interval_days: number;
  next_review_at: Date;
}

export interface NextReview {
  nextReviewAt: Date;
  interval: number;
  easeFactor: number;
}

/**
 * Calculate quality rating for listening exercises
 * 
 * Quality rating: 0-5 (SM-2 standard)
 * - 0: Fail (incorrect)
 * - 1: Barely passing (60-69% accuracy)
 * - 2: Passing (70-79% accuracy)
 * - 3: Good (80-89% accuracy)
 * - 4: Excellent (90-99% accuracy, first attempt)
 * - 5: Perfect (100% accuracy, first attempt)
 * 
 * @param correct - Whether answer was marked correct
 * @param accuracy_score - Accuracy percentage (0-100)
 * @param time_spent_seconds - Time spent on exercise
 * @param expected_duration - Expected duration for exercise
 * @param attempts - Total attempts for this exercise
 * @returns Quality rating 0-5
 */
export function calculateQualityRating(
  correct: boolean,
  accuracy_score: number,
  time_spent_seconds: number,
  expected_duration: number,
  attempts: number
): QualityRating {
  // Validate inputs
  if (accuracy_score < 0 || accuracy_score > 100) {
    throw new Error(`Invalid accuracy_score: ${accuracy_score}. Must be 0-100.`);
  }
  
  if (attempts < 1) {
    throw new Error(`Invalid attempts: ${attempts}. Must be >= 1.`);
  }
  
  // Fail: incorrect answer
  if (!correct || accuracy_score < 60) {
    return 0;
  }
  
  // Perfect: 100% accuracy on first attempt
  if (accuracy_score === 100 && attempts === 1) {
    return 5;
  }
  
  // Excellent: 90%+ accuracy on first attempt
  if (accuracy_score >= 90 && attempts === 1) {
    return 4;
  }
  
  // Good: 80%+ accuracy (any attempts)
  if (accuracy_score >= 80) {
    return 3;
  }
  
  // Passing: 70-79% accuracy
  if (accuracy_score >= 70) {
    return 2;
  }
  
  // Barely passing: 60-69% accuracy
  return 1;
}

/**
 * Calculate next review date using SM-2 algorithm
 * 
 * Interval progression:
 * - Quality >= 3 (pass): 1 day → 6 days → 15 days → ...
 * - Quality < 3 (fail): reset to 1 day
 * 
 * Ease factor adjusts based on quality (1.3 - 2.5+)
 * 
 * @param currentProgress - Current user progress data
 * @param qualityRating - Quality score 0-5
 * @returns Updated progress with next review date
 */
export function calculateNextReview(
  currentProgress: { ease_factor: number; interval_days: number },
  qualityRating: QualityRating
): NextReview {
  let { ease_factor, interval_days } = currentProgress;
  
  // Quality >= 3: Successful review (increment interval)
  if (qualityRating >= 3) {
    // First review: 1 day
    if (interval_days === 0) {
      interval_days = 1;
    } 
    // Second review: 6 days
    else if (interval_days === 1) {
      interval_days = 6;
    } 
    // Subsequent reviews: multiply by ease factor
    else {
      interval_days = Math.round(interval_days * ease_factor);
    }
    
    // Update ease factor using SM-2 formula
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    ease_factor = ease_factor + (0.1 - (5 - qualityRating) * (0.08 + (5 - qualityRating) * 0.02));
  } 
  // Quality < 3: Failed review (reset interval)
  else {
    interval_days = 1;
  }
  
  // Clamp ease factor to minimum 1.3
  ease_factor = Math.max(1.3, ease_factor);
  
  // Calculate next review date
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval_days);
  nextReviewAt.setHours(0, 0, 0, 0); // Normalize to midnight
  
  return {
    nextReviewAt,
    interval: interval_days,
    easeFactor: Math.round(ease_factor * 100) / 100, // Round to 2 decimals
  };
}

/**
 * Update user progress after exercise submission
 * 
 * This function:
 * 1. Fetches or creates progress record
 * 2. Calculates quality rating
 * 3. Calculates next review date (SRS)
 * 4. Updates progress in database
 * 
 * @param userId - User ID
 * @param exerciseId - Exercise ID
 * @param result - Exercise result data
 * @returns Updated progress with quality and next review date
 */
export async function updateProgress(
  userId: string,
  exerciseId: string,
  result: {
    correct: boolean;
    accuracy_score: number;
    time_spent_seconds: number;
  }
) {
  try {
    // Fetch exercise metadata
    const exercise = await prisma.dictationExercise.findUnique({
      where: { id: exerciseId },
      include: {
        content: {
          select: {
            duration: true,
          },
        },
      },
    });
    
    if (!exercise) {
      throw new Error(`Exercise not found: ${exerciseId}`);
    }
    
    // Fetch or create progress record
    const existingProgress = await prisma.$queryRaw<Array<{
      total_attempts: number;
      ease_factor: number;
      interval_days: number;
    }>>`
      SELECT 
        COUNT(*)::int as total_attempts,
        2.5::float as ease_factor,
        0::int as interval_days
      FROM "DictationAttempt"
      WHERE "userId" = ${userId} AND "exerciseId" = ${exerciseId}
    `;
    
    const attempts = (existingProgress[0]?.total_attempts || 0) + 1; // Include current attempt
    
    // Calculate quality rating
    const quality = calculateQualityRating(
      result.correct,
      result.accuracy_score,
      result.time_spent_seconds,
      exercise.content.duration || 30, // Default 30 seconds
      attempts
    );
    
    // Get previous progress for SRS calculation
    const previousProgress = {
      ease_factor: existingProgress[0]?.ease_factor || 2.5,
      interval_days: existingProgress[0]?.interval_days || 0,
    };
    
    // Calculate next review
    const { nextReviewAt, interval, easeFactor } = calculateNextReview(
      previousProgress,
      quality
    );
    
    // Update content progress (aggregate stats)
    await prisma.userListeningProgress.upsert({
      where: {
        userId_contentId: {
          userId: userId,
          contentId: exercise.contentId,
        },
      },
      create: {
        userId: userId,
        contentId: exercise.contentId,
        status: 'in_progress',
        progressPercent: result.correct ? 10 : 5,
        exercisesCompleted: result.correct ? 1 : 0,
        averageAccuracy: result.accuracy_score,
      },
      update: {
        exercisesCompleted: result.correct ? { increment: 1 } : undefined,
        averageAccuracy: result.accuracy_score, // TODO: Calculate weighted average
        status: 'in_progress',
        updatedAt: new Date(),
      },
    });
    
    return {
      quality,
      nextReviewAt,
      interval,
      easeFactor,
      xp_earned: result.correct ? Math.round(quality * 2) : 0, // 0-10 XP
    };
  } catch (error) {
    console.error('[listening-srs] updateProgress failed:', {
      userId,
      exerciseId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error('Failed to update listening progress');
  }
}
