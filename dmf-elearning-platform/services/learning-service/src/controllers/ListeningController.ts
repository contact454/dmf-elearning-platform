import { Request, Response } from 'express';
import { z } from 'zod';
import { ListeningService } from '../services/ListeningService';
import { updateProgress as updateSRSProgress } from '../lib/listening-srs';
import { updateStreak } from '../services/streakService';

const listeningService = new ListeningService();

const dictationMistakeSchema = z.object({
  expected: z.string().trim().optional().default(''),
  actual: z.string().trim().optional().default(''),
  position: z.number().int().min(0),
  type: z.enum(['missing', 'extra', 'wrong']),
});

const submitAttemptSchema = z.object({
  userText: z.string().trim().min(1),
  accuracy: z.number().min(0).max(100).optional().default(0),
  wordsCorrect: z.number().int().min(0).optional().default(0),
  wordsTotal: z.number().int().min(0).optional().default(0),
  mistakes: z.array(dictationMistakeSchema).optional().default([]),
  listenCount: z.number().int().min(1).optional().default(1),
  timeSpent: z.number().int().min(0).optional().default(0),
});

const updateProgressSchema = z.object({
  totalListenTime: z.number().min(0).optional(),
  lastPosition: z.number().min(0).optional(),
  playCount: z.number().int().min(0).optional(),
});

const listContentQuerySchema = z.object({
  level: z.string().trim().min(1).optional(),
  topic: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const featuredQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(5),
});

const contentLookupSchema = z.object({
  id: z.string().trim().min(1),
  userId: z.string().trim().min(1).optional(),
});

const exerciseLookupSchema = z.object({
  exerciseId: z.string().trim().min(1),
});

const createContentSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  level: z.string().trim().min(1),
  topic: z.string().trim().optional(),
  audioUrl: z.string().trim().optional(),
  duration: z.coerce.number().int().min(0).optional(),
  transcript: z.string().trim().min(1),
  transcriptVi: z.string().trim().optional(),
  segments: z.unknown().optional(),
  source: z.string().trim().optional(),
  speaker: z.string().trim().optional(),
});

function asString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
}

function sendValidationError(res: Response, message: string, details: unknown) {
  return res.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message,
      details,
    },
  });
}

function sendInternalError(res: Response, message: string) {
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  });
}

function getAuthenticatedUserId(req: Request, res: Response): string | undefined {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_MISSING_CONTEXT',
        message: 'Missing authenticated user context',
      },
    });
    return undefined;
  }
  return userId;
}

export class ListeningController {
  // ═══════════════════════════════════════════════════════════════
  // Content Endpoints
  // ═══════════════════════════════════════════════════════════════

  /**
   * GET /api/listening
   * List listening content
   */
  static async list(req: Request, res: Response) {
    try {
      const query = listContentQuerySchema.parse({
        level: asString(req.query.level),
        topic: asString(req.query.topic),
        search: asString(req.query.search),
        limit: asString(req.query.limit),
        offset: asString(req.query.offset),
      });

      const result = await listeningService.getContent({
        level: query.level,
        topic: query.topic,
        search: query.search,
        limit: query.limit,
        offset: query.offset,
      });

      return res.status(200).json({
        success: true,
        data: result.items,
        pagination: {
          total: result.total,
          limit: query.limit,
          offset: query.offset,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid listening list query', error.issues);
      }

      console.error('Error listing listening content:', error);
      return sendInternalError(res, 'Failed to fetch listening content');
    }
  }

  /**
   * GET /api/listening/featured
   */
  static async featured(req: Request, res: Response) {
    try {
      const query = featuredQuerySchema.parse({
        limit: asString(req.query.limit),
      });
      const items = await listeningService.getFeatured(query.limit);

      return res.status(200).json({
        success: true,
        data: items,
        count: items.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid featured query', error.issues);
      }

      console.error('Error fetching featured content:', error);
      return sendInternalError(res, 'Failed to fetch featured content');
    }
  }

  /**
   * GET /api/listening/stats
   */
  static async stats(req: Request, res: Response) {
    try {
      const stats = await listeningService.getStats();
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      return sendInternalError(res, 'Failed to fetch statistics');
    }
  }

  /**
   * GET /api/listening/levels
   */
  static async levels(req: Request, res: Response) {
    try {
      const levels = await listeningService.getLevels();
      return res.status(200).json({
        success: true,
        data: levels,
        count: levels.length,
      });
    } catch (error) {
      console.error('Error fetching levels:', error);
      return sendInternalError(res, 'Failed to fetch levels');
    }
  }

  /**
   * GET /api/listening/:id
   */
  static async getById(req: Request, res: Response) {
    try {
      const params = contentLookupSchema.parse({
        id: asString(req.params.id),
        userId: asString(req.query.userId),
      });

      let content;
      if (params.userId) {
        content = await listeningService.getWithProgress(params.id, params.userId);
      } else {
        content = await listeningService.getById(params.id);
      }

      if (!content) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CONTENT_NOT_FOUND',
            message: 'Content not found',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: content,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid content lookup input', error.issues);
      }

      console.error('Error fetching content:', error);
      return sendInternalError(res, 'Failed to fetch content');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Exercise Endpoints
  // ═══════════════════════════════════════════════════════════════

  /**
   * GET /api/listening/:id/exercises
   */
  static async getExercises(req: Request, res: Response) {
    try {
      const params = z.object({ id: z.string().trim().min(1) }).parse({
        id: asString(req.params.id),
      });
      const exercises = await listeningService.getExercises(params.id);

      return res.status(200).json({
        success: true,
        data: exercises,
        count: exercises.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid exercises lookup input', error.issues);
      }

      console.error('Error fetching exercises:', error);
      return sendInternalError(res, 'Failed to fetch exercises');
    }
  }

  /**
   * GET /api/listening/exercise/:exerciseId
   */
  static async getExercise(req: Request, res: Response) {
    try {
      const params = exerciseLookupSchema.parse({
        exerciseId: asString(req.params.exerciseId),
      });
      const exercise = await listeningService.getExerciseById(params.exerciseId);

      if (!exercise) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'EXERCISE_NOT_FOUND',
            message: 'Exercise not found',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: exercise,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid exercise lookup input', error.issues);
      }

      console.error('Error fetching exercise:', error);
      return sendInternalError(res, 'Failed to fetch exercise');
    }
  }

  /**
   * POST /api/listening/exercise/:exerciseId/attempt
   */
  static async submitAttempt(req: Request, res: Response) {
    try {
      const exerciseId = asString(req.params.exerciseId);
      const userId = getAuthenticatedUserId(req, res);

      if (!exerciseId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required field: exerciseId',
          },
        });
      }
      if (!userId) {
        return;
      }

      const payload = submitAttemptSchema.parse(req.body);

      // Submit attempt to database
      const attempt = await listeningService.submitAttempt(exerciseId, userId, {
        userText: payload.userText,
        accuracy: payload.accuracy,
        wordsCorrect: payload.wordsCorrect,
        wordsTotal: payload.wordsTotal,
        mistakes: payload.mistakes,
        listenCount: payload.listenCount,
        timeSpent: payload.timeSpent,
      });

      // Update SRS progress
      const srsResult = await updateSRSProgress(userId, exerciseId, {
        correct: payload.accuracy >= 70, // 70%+ considered correct
        accuracy_score: payload.accuracy,
        time_spent_seconds: payload.timeSpent,
      });

      // Update streak if correct
      if (payload.accuracy >= 70) {
        await updateStreak(userId);
      }

      return res.status(201).json({
        success: true,
        data: {
          attempt,
          srs: {
            quality: srsResult.quality,
            nextReviewAt: srsResult.nextReviewAt,
            interval: srsResult.interval,
            easeFactor: srsResult.easeFactor,
            xpEarned: srsResult.xp_earned,
          },
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid listening attempt payload', error.issues);
      }

      console.error('Error submitting attempt:', error);
      return sendInternalError(res, 'Failed to submit attempt');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Progress Endpoints
  // ═══════════════════════════════════════════════════════════════

  /**
   * POST /api/listening/:id/start
   */
  static async startListening(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      const userId = getAuthenticatedUserId(req, res);

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing content id',
          },
        });
      }
      if (!userId) {
        return;
      }

      const progress = await listeningService.startListening(userId, id);
      return res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      console.error('Error starting listening:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to start listening',
        },
      });
    }
  }

  /**
   * PUT /api/listening/:id/progress
   */
  static async updateProgress(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      const userId = getAuthenticatedUserId(req, res);

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing content id',
          },
        });
      }
      if (!userId) {
        return;
      }
      const payload = updateProgressSchema.parse(req.body);

      const progress = await listeningService.updateProgress(userId, id, {
        totalListenTime: payload.totalListenTime,
        lastPosition: payload.lastPosition,
        playCount: payload.playCount,
      });

      return res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid listening progress payload', error.issues);
      }
      console.error('Error updating progress:', error);
      return sendInternalError(res, 'Failed to update progress');
    }
  }

  /**
   * GET /api/listening/user/:userId/history
   */
  static async getUserHistory(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req, res);
      const status = asString(req.query.status);

      if (!userId) {
        return;
      }
      const allowedStatuses = ['not_started', 'in_progress', 'completed'] as const;
      if (status && !allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid listening history status filter',
          },
        });
      }

      const history = await listeningService.getUserHistory(userId, status);

      return res.status(200).json({
        success: true,
        data: history,
        count: history.length,
      });
    } catch (error) {
      console.error('Error fetching history:', error);
      return sendInternalError(res, 'Failed to fetch history');
    }
  }

  /**
   * GET /api/listening/user/:userId/stats
   */
  static async getUserStats(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }
      const stats = await listeningService.getUserStats(userId);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return sendInternalError(res, 'Failed to fetch user stats');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Content Management
  // ═══════════════════════════════════════════════════════════════

  /**
   * POST /api/listening
   */
  static async createContent(req: Request, res: Response) {
    try {
      const payload = createContentSchema.parse(req.body);

      const content = await listeningService.createContent({
        title: payload.title,
        description: payload.description,
        level: payload.level,
        topic: payload.topic,
        audioUrl: payload.audioUrl,
        duration: payload.duration,
        transcript: payload.transcript,
        transcriptVi: payload.transcriptVi,
        segments: payload.segments,
        source: payload.source,
        speaker: payload.speaker,
      });

      return res.status(201).json({
        success: true,
        data: content,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid listening content payload', error.issues);
      }

      console.error('Error creating content:', error);
      return sendInternalError(res, 'Failed to create content');
    }
  }

  /**
   * POST /api/listening/:id/exercises/generate
   */
  static async generateExercises(req: Request, res: Response) {
    try {
      const params = z.object({ id: z.string().trim().min(1) }).parse({
        id: asString(req.params.id),
      });
      const exercises = await listeningService.generateExercisesFromSegments(params.id);

      return res.status(201).json({
        success: true,
        data: exercises,
        count: exercises.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid exercise generation input', error.issues);
      }

      console.error('Error generating exercises:', error);
      return sendInternalError(res, 'Failed to generate exercises');
    }
  }

  /**
   * POST /api/listening/seed
   * Seed sample listening content
   */
  static async seedContent(req: Request, res: Response) {
    try {
      const count = await listeningService.seedContent();

      return res.status(201).json({
        success: true,
        data: { count },
        message: `Seeded ${count} listening content items`,
      });
    } catch (error) {
      console.error('Error seeding content:', error);
      return sendInternalError(res, 'Failed to seed content');
    }
  }
}
