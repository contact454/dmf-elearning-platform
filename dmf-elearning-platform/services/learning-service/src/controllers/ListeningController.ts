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

function asString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
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
      const { level, topic, search, limit, offset } = req.query;

      const result = await listeningService.getContent({
        level: level as string,
        topic: topic as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : 20,
        offset: offset ? parseInt(offset as string, 10) : 0,
      });

      return res.status(200).json({
        success: true,
        data: result.items,
        pagination: {
          total: result.total,
          limit: limit ? parseInt(limit as string, 10) : 20,
          offset: offset ? parseInt(offset as string, 10) : 0,
        },
      });
    } catch (error) {
      console.error('Error listing listening content:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch listening content',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/listening/featured
   */
  static async featured(req: Request, res: Response) {
    try {
      const { limit } = req.query;
      const items = await listeningService.getFeatured(
        limit ? parseInt(limit as string, 10) : 5
      );

      return res.status(200).json({
        success: true,
        data: items,
        count: items.length,
      });
    } catch (error) {
      console.error('Error fetching featured content:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch featured content',
      });
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
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics',
      });
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
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch levels',
      });
    }
  }

  /**
   * GET /api/listening/:id
   */
  static async getById(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      const userId = asString(req.query.userId);

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing content id',
        });
      }

      let content;
      if (userId) {
        content = await listeningService.getWithProgress(id, userId);
      } else {
        content = await listeningService.getById(id);
      }

      if (!content) {
        return res.status(404).json({
          success: false,
          error: 'Content not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: content,
      });
    } catch (error) {
      console.error('Error fetching content:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch content',
      });
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
      const id = asString(req.params.id);
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing content id',
        });
      }
      const exercises = await listeningService.getExercises(id);

      return res.status(200).json({
        success: true,
        data: exercises,
        count: exercises.length,
      });
    } catch (error) {
      console.error('Error fetching exercises:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch exercises',
      });
    }
  }

  /**
   * GET /api/listening/exercise/:exerciseId
   */
  static async getExercise(req: Request, res: Response) {
    try {
      const exerciseId = asString(req.params.exerciseId);
      if (!exerciseId) {
        return res.status(400).json({
          success: false,
          error: 'Missing exercise id',
        });
      }
      const exercise = await listeningService.getExerciseById(exerciseId);

      if (!exercise) {
        return res.status(404).json({
          success: false,
          error: 'Exercise not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: exercise,
      });
    } catch (error) {
      console.error('Error fetching exercise:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch exercise',
      });
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
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid listening attempt payload',
            details: error.issues,
          },
        });
      }

      console.error('Error submitting attempt:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to submit attempt',
        },
      });
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
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid listening progress payload',
            details: error.issues,
          },
        });
      }
      console.error('Error updating progress:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update progress',
        },
      });
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
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch history',
        },
      });
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
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user stats',
        },
      });
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
      const { title, description, level, topic, audioUrl, duration, transcript, transcriptVi, segments, source, speaker } = req.body;

      if (!title || !level || !transcript) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title, level, transcript',
        });
      }

      const content = await listeningService.createContent({
        title,
        description,
        level,
        topic,
        audioUrl,
        duration,
        transcript,
        transcriptVi,
        segments,
        source,
        speaker,
      });

      return res.status(201).json({
        success: true,
        data: content,
      });
    } catch (error) {
      console.error('Error creating content:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create content',
      });
    }
  }

  /**
   * POST /api/listening/:id/exercises/generate
   */
  static async generateExercises(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing content id',
        });
      }
      const exercises = await listeningService.generateExercisesFromSegments(id);

      return res.status(201).json({
        success: true,
        data: exercises,
        count: exercises.length,
      });
    } catch (error) {
      console.error('Error generating exercises:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate exercises',
      });
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
      return res.status(500).json({
        success: false,
        error: 'Failed to seed content',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
