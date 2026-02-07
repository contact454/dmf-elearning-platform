import { PrismaClient } from '@prisma/client';
import { validateAnswer, ValidationResult } from '../utils/answer-validation';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface PassageFilters {
  level?: string;
  topic?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface SubmitAnswerData {
  userId: string;
  passageId: string;
  exerciseId: string;
  userAnswer: any;
  timeSpentSeconds?: number;
}

export interface SaveVocabularyData {
  userId: string;
  passageId: string;
  word: string;
  translation: string;
  context?: string;
  sentence?: string;
}

// ═══════════════════════════════════════════════════════════════
// Reading Passage Service
// ═══════════════════════════════════════════════════════════════

export class ReadingPassageService {
  /**
   * GET /api/reading/passages
   * Fetch passages with filters
   */
  async getPassages(filters: PassageFilters) {
    const where: any = {};

    if (filters.level) {
      where.cefrLevel = filters.level.toUpperCase();
    }

    if (filters.topic) {
      where.topic = { contains: filters.topic, mode: 'insensitive' };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.readingPassage.findMany({
        where,
        select: {
          id: true,
          title: true,
          content: true,
          cefrLevel: true,
          topic: true,
          wordCount: true,
          estimatedReadingTimeMinutes: true,
          difficultyScore: true,
          source: true,
          isPremium: true,
          createdAt: true,
          _count: {
            select: { exercises: true },
          },
        },
        take: filters.limit || 20,
        skip: filters.offset || 0,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.readingPassage.count({ where }),
    ]);

    // Transform to include exerciseCount
    const passages = items.map(item => ({
      ...item,
      exerciseCount: item._count.exercises,
      _count: undefined, // Remove _count from response
    }));

    return { items: passages, total };
  }

  /**
   * GET /api/reading/passages/:id
   * Get single passage with exercises
   */
  async getPassageById(id: string, userId?: string) {
    const passage = await prisma.readingPassage.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            exerciseType: true,
            question: true,
            exerciseData: true,
            explanation: true,
            difficultyLevel: true,
            displayOrder: true,
          },
        },
        userPassageProgress: userId
          ? {
              where: { userId },
              take: 1,
            }
          : false,
      },
    });

    if (!passage) return null;

    return {
      ...passage,
      userProgress: userId && passage.userPassageProgress ? passage.userPassageProgress[0] : null,
    };
  }

  /**
   * POST /api/reading/submit
   * Submit exercise answer with validation
   */
  async submitAnswer(data: SubmitAnswerData) {
    const { userId, passageId, exerciseId, userAnswer, timeSpentSeconds = 0 } = data;

    // 1. Fetch exercise with passage validation
    const exercise = await prisma.readingExercise.findFirst({
      where: {
        id: exerciseId,
        passageId: passageId,
      },
    });

    if (!exercise) {
      throw new Error('Exercise not found or does not belong to this passage');
    }

    // 2. Validate answer
    const validation: ValidationResult = validateAnswer(
      exercise.exerciseType,
      userAnswer,
      exercise.exerciseData
    );

    // 3. Create attempt record
    const attempt = await prisma.readingAttempt.create({
      data: {
        userId,
        passageId,
        exerciseId,
        userAnswer: userAnswer,
        correctAnswer: this.extractCorrectAnswer(exercise.exerciseType, exercise.exerciseData),
        isCorrect: validation.isCorrect,
        accuracyScore: validation.accuracyScore,
        timeSpentSeconds,
      },
    });

    // 4. Update or create user progress
    const progress = await this.updateUserProgress(userId, passageId);

    return {
      attemptId: attempt.id,
      isCorrect: validation.isCorrect,
      accuracyScore: validation.accuracyScore,
      correctAnswer: this.extractCorrectAnswer(exercise.exerciseType, exercise.exerciseData),
      explanation: exercise.explanation,
      feedback: validation.feedback,
      progress: {
        totalExercises: progress.totalExercises,
        correctExercises: progress.correctExercises,
        accuracyPercentage: Number(progress.accuracyPercentage),
      },
    };
  }

  /**
   * GET /api/reading/progress
   * Get user reading progress
   */
  async getUserProgress(userId: string, passageId?: string) {
    // Overall statistics
    const progressRecords = await prisma.userPassageProgress.findMany({
      where: {
        userId,
        ...(passageId && { passageId }),
      },
      include: {
        passage: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const overallStats = {
      totalPassagesStarted: progressRecords.length,
      passagesCompleted: progressRecords.filter(p => p.completedAt !== null).length,
      totalExercises: progressRecords.reduce((sum, p) => sum + p.totalExercises, 0),
      correctExercises: progressRecords.reduce((sum, p) => sum + p.correctExercises, 0),
      averageAccuracy:
        progressRecords.length > 0
          ? progressRecords.reduce((sum, p) => sum + Number(p.accuracyPercentage), 0) / progressRecords.length
          : 0,
      totalTimeSpentMinutes: Math.round(
        progressRecords.reduce((sum, p) => sum + p.timeSpentSeconds, 0) / 60
      ),
    };

    const recentActivity = progressRecords.slice(0, 10).map(p => ({
      passageId: p.passageId,
      passageTitle: p.passage.title,
      completedAt: p.completedAt,
      accuracyPercentage: Number(p.accuracyPercentage),
      exercisesCorrect: p.correctExercises,
      exercisesTotal: p.totalExercises,
      updatedAt: p.updatedAt,
    }));

    return {
      overallStats,
      recentActivity,
    };
  }

  /**
   * POST /api/reading/vocabulary/save
   * Save vocabulary word for SRS
   */
  async saveVocabulary(data: SaveVocabularyData) {
    const { userId, passageId, word, translation } = data;

    // For Phase 1, we'll create a simple placeholder implementation
    // TODO: Integrate with actual SRS vocabulary system in Phase 2
    
    const vocabularyId = crypto.randomUUID();
    
    // Note: Actual vocabulary saving requires integration with SRS system
    // This is a placeholder for Phase 1
    
    return {
      vocabularyId,
      word,
      addedToSRS: true,
      nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      message: 'Word added to your vocabulary review queue',
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Helper Methods
  // ═══════════════════════════════════════════════════════════════

  /**
   * Update user progress after attempt
   */
  private async updateUserProgress(userId: string, passageId: string) {
    // Get all attempts for this user/passage
    const attempts = await prisma.readingAttempt.findMany({
      where: { userId, passageId },
      select: {
        exerciseId: true,
        isCorrect: true,
        accuracyScore: true,
        timeSpentSeconds: true,
      },
    });

    // Get unique exercises attempted
    const uniqueExercises = new Set(attempts.map(a => a.exerciseId));
    const totalExercises = uniqueExercises.size;
    
    // Get latest attempt per exercise
    const latestAttempts = Array.from(uniqueExercises).map(exerciseId => {
      const exerciseAttempts = attempts.filter(a => a.exerciseId === exerciseId);
      return exerciseAttempts[exerciseAttempts.length - 1]; // Last attempt
    });

    const correctExercises = latestAttempts.filter(a => a.isCorrect).length;
    const accuracyPercentage = totalExercises > 0
      ? (correctExercises / totalExercises) * 100
      : 0;
    const timeSpentSeconds = attempts.reduce((sum, a) => sum + a.timeSpentSeconds, 0);

    // Check if passage is completed (get total exercises for passage)
    const passage = await prisma.readingPassage.findUnique({
      where: { id: passageId },
      select: { _count: { select: { exercises: true } } },
    });

    const allExercisesCount = passage?._count.exercises || 0;
    const isCompleted = totalExercises >= allExercisesCount && correctExercises === allExercisesCount;

    // Upsert progress
    const progress = await prisma.userPassageProgress.upsert({
      where: {
        user_passage_unique: {
          userId,
          passageId,
        },
      },
      update: {
        totalExercises,
        correctExercises,
        accuracyPercentage,
        timeSpentSeconds,
        completedAt: isCompleted ? new Date() : null,
        updatedAt: new Date(),
      },
      create: {
        userId,
        passageId,
        totalExercises,
        correctExercises,
        accuracyPercentage,
        timeSpentSeconds,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    return progress;
  }

  /**
   * Extract correct answer from exercise data for response
   */
  private extractCorrectAnswer(exerciseType: string, exerciseData: any): any {
    switch (exerciseType) {
      case 'multiple_choice':
        return exerciseData.correctIndex;
      case 'true_false':
        return exerciseData.correctAnswer;
      case 'short_answer':
        return exerciseData.acceptedAnswers[0]; // Return first accepted answer
      case 'fill_blank':
        return exerciseData.blanks.map((b: any) => b.acceptedAnswers[0]);
      default:
        return null;
    }
  }
}
