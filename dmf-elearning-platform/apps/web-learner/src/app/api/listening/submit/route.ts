// POST /api/listening/submit
// Submit listening exercise attempt and calculate score using SRS algorithm

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/middleware/auth';

/**
 * Calculate SM-2 SRS parameters
 * @param quality - Response quality (0-5, where 3+ is correct)
 * @param easeFactor - Current ease factor
 * @param interval - Current interval
 * @param repetitions - Number of repetitions
 * @returns Updated SRS parameters
 */
function calculateSRS(
  quality: number,
  easeFactor: number,
  interval: number,
  repetitions: number
): { easeFactor: number; interval: number; repetitions: number } {
  let newEase = easeFactor;
  let newInterval = interval;
  let newReps = repetitions;

  if (quality >= 3) {
    // Correct response
    if (newReps === 0) {
      newInterval = 1;
    } else if (newReps === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newReps += 1;
  } else {
    // Incorrect response - restart
    newReps = 0;
    newInterval = 1;
  }

  // Update ease factor
  newEase = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  return {
    easeFactor: newEase,
    interval: newInterval,
    repetitions: newReps,
  };
}

/**
 * Calculate score and accuracy for different exercise types
 */
function calculateScore(
  exerciseType: string,
  userAnswer: any,
  correctAnswer: any
): { score: number; accuracy: number; isCorrect: boolean } {
  switch (exerciseType) {
    case 'MULTIPLE_CHOICE':
      const isCorrectMC = userAnswer === correctAnswer;
      return {
        score: isCorrectMC ? 100 : 0,
        accuracy: isCorrectMC ? 1.0 : 0.0,
        isCorrect: isCorrectMC,
      };

    case 'DICTATION':
      // Compare transcription similarity
      const userText = (userAnswer || '').toLowerCase().trim();
      const correctText = (correctAnswer || '').toLowerCase().trim();
      
      if (!userText || !correctText) {
        return { score: 0, accuracy: 0, isCorrect: false };
      }

      // Simple word-by-word comparison
      const userWords = userText.split(/\s+/);
      const correctWords = correctText.split(/\s+/);
      
      const matchingWords = userWords.filter((word, idx) => 
        word === correctWords[idx]
      ).length;
      
      const accuracy = correctWords.length > 0 
        ? matchingWords / correctWords.length 
        : 0;
      
      return {
        score: Math.round(accuracy * 100),
        accuracy,
        isCorrect: accuracy >= 0.8, // 80% threshold
      };

    case 'FILL_IN_BLANK':
      // Array of blank answers
      const userBlanks = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
      const correctBlanks = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
      
      const correctCount = userBlanks.filter((answer, idx) => 
        answer?.toLowerCase().trim() === correctBlanks[idx]?.toLowerCase().trim()
      ).length;
      
      const fillAccuracy = correctBlanks.length > 0 
        ? correctCount / correctBlanks.length 
        : 0;
      
      return {
        score: Math.round(fillAccuracy * 100),
        accuracy: fillAccuracy,
        isCorrect: fillAccuracy === 1.0,
      };

    case 'AUDIO_IMAGE_MATCHING':
      const isCorrectMatch = userAnswer === correctAnswer;
      return {
        score: isCorrectMatch ? 100 : 0,
        accuracy: isCorrectMatch ? 1.0 : 0.0,
        isCorrect: isCorrectMatch,
      };

    default:
      return { score: 0, accuracy: 0, isCorrect: false };
  }
}

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body = await request.json();
    
    // Extract userId from authenticated user (JWT token) - NEVER from request body!
    const userId = user.userId;
    
    const {
      exerciseId,
      userAnswer,
      timeSpent = 0,
      playbackCount = 1,
      pauseCount = 0,
    } = body;

    // Validate input
    if (!exerciseId || userAnswer === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: exerciseId, userAnswer',
        },
        { status: 400 }
      );
    }

    // Fetch exercise
    const exercise = await prisma.listeningExercise.findUnique({
      where: { id: exerciseId },
      select: {
        id: true,
        exerciseType: true,
        correctAnswer: true,
        maxScore: true,
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { success: false, error: 'Exercise not found' },
        { status: 404 }
      );
    }

    // Calculate score
    const { score, accuracy, isCorrect } = calculateScore(
      exercise.exerciseType,
      userAnswer,
      exercise.correctAnswer
    );

    // Fetch or create progress
    let progress = await prisma.listeningProgress.findUnique({
      where: {
        userId_exerciseId: { userId, exerciseId },
      },
    });

    let srsParams = {
      easeFactor: progress?.currentEase || 2.5,
      interval: progress?.currentInterval || 0,
      repetitions: 0,
    };

    // Calculate SRS based on performance
    const quality = isCorrect ? (accuracy >= 0.95 ? 5 : 4) : (accuracy >= 0.5 ? 2 : 1);
    srsParams = calculateSRS(
      quality,
      srsParams.easeFactor,
      srsParams.interval,
      progress?.totalAttempts || 0
    );

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + srsParams.interval);

    // Create attempt record
    const attempt = await prisma.listeningAttempt.create({
      data: {
        userId,
        exerciseId,
        userAnswer,
        isCorrect,
        score,
        accuracy,
        timeSpent,
        playbackCount,
        pauseCount,
        easeFactor: srsParams.easeFactor,
        interval: srsParams.interval,
        repetitions: srsParams.repetitions,
        nextReviewAt,
      },
    });

    // Update or create progress
    const consecutiveCorrect = isCorrect 
      ? (progress?.consecutiveCorrect || 0) + 1 
      : 0;
    
    const status = 
      consecutiveCorrect >= 5 ? 'mastered' :
      consecutiveCorrect >= 2 ? 'reviewing' :
      progress ? 'learning' : 'new';

    progress = await prisma.listeningProgress.upsert({
      where: {
        userId_exerciseId: { userId, exerciseId },
      },
      create: {
        userId,
        exerciseId,
        status,
        totalAttempts: 1,
        correctAttempts: isCorrect ? 1 : 0,
        bestScore: score,
        bestAccuracy: accuracy,
        currentInterval: srsParams.interval,
        currentEase: srsParams.easeFactor,
        nextReviewAt,
        lastReviewedAt: new Date(),
        consecutiveCorrect,
        lastAttemptAt: new Date(),
        masteredAt: status === 'mastered' ? new Date() : null,
      },
      update: {
        status,
        totalAttempts: { increment: 1 },
        correctAttempts: isCorrect ? { increment: 1 } : undefined,
        bestScore: Math.max(progress?.bestScore || 0, score),
        bestAccuracy: Math.max(progress?.bestAccuracy || 0, accuracy),
        currentInterval: srsParams.interval,
        currentEase: srsParams.easeFactor,
        nextReviewAt,
        lastReviewedAt: new Date(),
        consecutiveCorrect,
        lastAttemptAt: new Date(),
        masteredAt: status === 'mastered' && !progress?.masteredAt ? new Date() : undefined,
      },
    });

    // Update exercise stats (async, don't wait)
    prisma.listeningExercise.update({
      where: { id: exerciseId },
      data: {
        playCount: { increment: 1 },
        // Calculate rolling average (simplified)
      },
    }).catch(err => console.error('Failed to update exercise stats:', err));

    return NextResponse.json({
      success: true,
      data: {
        attempt: {
          id: attempt.id,
          score,
          accuracy,
          isCorrect,
          nextReviewAt,
        },
        progress: {
          status,
          totalAttempts: progress.totalAttempts,
          correctAttempts: progress.correctAttempts,
          consecutiveCorrect,
          bestScore: progress.bestScore,
        },
        srs: {
          interval: srsParams.interval,
          easeFactor: srsParams.easeFactor,
          nextReviewAt,
        },
      },
    });

  } catch (error) {
    console.error('Error submitting listening attempt:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit attempt',
      },
      { status: 500 }
    );
  }
});
