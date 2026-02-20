import { Request, Response } from 'express';
import { z } from 'zod';
import { SpeakingService } from '../services/SpeakingService';

const speakingService = new SpeakingService();

const submitAttemptSchema = z.object({
  transcript: z.string().trim().min(1),
  audioUrl: z.string().trim().min(1).optional(),
  audioDuration: z.number().min(0).optional(),
  recordingTime: z.number().min(0).optional(),
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

export class SpeakingController {
  // ═══════════════════════════════════════════════════════════════
  // Prompt Endpoints
  // ═══════════════════════════════════════════════════════════════

  /**
   * GET /api/speaking
   * List speaking prompts
   */
  static async list(req: Request, res: Response) {
    try {
      const { level, category, topic, search, limit, offset } = req.query;

      const result = await speakingService.getPrompts({
        level: level as string,
        category: category as string,
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
      console.error('Error listing speaking prompts:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch speaking prompts',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/speaking/featured
   */
  static async featured(req: Request, res: Response) {
    try {
      const { limit } = req.query;
      const items = await speakingService.getFeatured(
        limit ? parseInt(limit as string, 10) : 5
      );

      return res.status(200).json({
        success: true,
        data: items,
        count: items.length,
      });
    } catch (error) {
      console.error('Error fetching featured prompts:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch featured prompts',
      });
    }
  }

  /**
   * GET /api/speaking/stats
   */
  static async stats(req: Request, res: Response) {
    try {
      const stats = await speakingService.getStats();
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
   * GET /api/speaking/levels
   */
  static async levels(req: Request, res: Response) {
    try {
      const levels = await speakingService.getLevels();
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
   * GET /api/speaking/categories
   */
  static async categories(req: Request, res: Response) {
    try {
      const categories = await speakingService.getCategories();
      return res.status(200).json({
        success: true,
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch categories',
      });
    }
  }

  /**
   * GET /api/speaking/:id
   */
  static async getById(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      const userId = asString(req.query.userId);

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing prompt id',
        });
      }

      let prompt;
      if (userId) {
        prompt = await speakingService.getWithProgress(id, userId);
      } else {
        prompt = await speakingService.getById(id);
      }

      if (!prompt) {
        return res.status(404).json({
          success: false,
          error: 'Prompt not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: prompt,
      });
    } catch (error) {
      console.error('Error fetching prompt:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch prompt',
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Attempt Endpoints
  // ═══════════════════════════════════════════════════════════════

  /**
   * POST /api/speaking/:id/attempt
   */
  static async submitAttempt(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      const userId = getAuthenticatedUserId(req, res);

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing prompt id',
          },
        });
      }
      if (!userId) {
        return;
      }

      const payload = submitAttemptSchema.parse(req.body);

      const attempt = await speakingService.submitAttempt(id, userId, {
        transcript: payload.transcript,
        audioUrl: payload.audioUrl,
        audioDuration: payload.audioDuration,
        recordingTime: payload.recordingTime,
      });

      return res.status(201).json({
        success: true,
        data: attempt,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid speaking attempt payload',
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

  /**
   * GET /api/speaking/:id/attempts
   */
  static async getAttempts(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      const userId = getAuthenticatedUserId(req, res);

      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing prompt id',
          },
        });
      }
      if (!userId) {
        return;
      }

      const attempts = await speakingService.getUserAttempts(userId, id);

      return res.status(200).json({
        success: true,
        data: attempts,
        count: attempts.length,
      });
    } catch (error) {
      console.error('Error fetching attempts:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch attempts',
        },
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // User Progress Endpoints
  // ═══════════════════════════════════════════════════════════════

  /**
   * GET /api/speaking/user/:userId/history
   */
  static async getUserHistory(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req, res);
      const status = asString(req.query.status);

      if (!userId) {
        return;
      }

      const history = await speakingService.getUserHistory(userId, status);

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
   * GET /api/speaking/user/:userId/stats
   */
  static async getUserStats(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }
      const stats = await speakingService.getUserStats(userId);

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
   * POST /api/speaking
   */
  static async createPrompt(req: Request, res: Response) {
    try {
      const {
        title,
        level,
        category,
        topic,
        promptText,
        promptTextVi,
        sampleResponse,
        sampleAudioUrl,
        targetWords,
        difficulty,
      } = req.body;

      if (!title || !level || !promptText) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title, level, promptText',
        });
      }

      const prompt = await speakingService.createPrompt({
        title,
        level,
        category,
        topic,
        promptText,
        promptTextVi,
        sampleResponse,
        sampleAudioUrl,
        targetWords,
        difficulty,
      });

      return res.status(201).json({
        success: true,
        data: prompt,
      });
    } catch (error) {
      console.error('Error creating prompt:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create prompt',
      });
    }
  }

  /**
   * POST /api/speaking/seed
   * Seed sample speaking prompts
   */
  static async seedContent(req: Request, res: Response) {
    try {
      const count = await speakingService.seedContent();

      return res.status(201).json({
        success: true,
        data: { count },
        message: `Seeded ${count} speaking prompts`,
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
