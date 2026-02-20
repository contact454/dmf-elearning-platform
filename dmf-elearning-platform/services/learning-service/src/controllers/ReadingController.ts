import { Request, Response } from 'express';
import { z } from 'zod';
import { ReadingService } from '../services/ReadingService';

const readingService = new ReadingService();

const recommendedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

const updateProgressSchema = z.object({
  progressPercent: z.number().min(0).max(100).optional(),
  lastPosition: z.number().min(0).optional(),
  wordsRead: z.number().int().min(0).optional(),
  totalReadTime: z.number().int().min(0).optional(),
  wordsLookedUp: z.array(z.string().trim().min(1)).optional(),
});

const completeReadingSchema = z.object({
  rating: z.number().min(0).max(5).optional(),
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

export class ReadingController {
  // ═══════════════════════════════════════════════════════════════
  // Content Endpoints
  // ═══════════════════════════════════════════════════════════════

  /**
   * GET /api/reading
   * List reading content with filters
   */
  static async list(req: Request, res: Response) {
    try {
      const { level, topic, search, limit, offset } = req.query;

      const result = await readingService.getContent({
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
      console.error('Error listing reading content:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch reading content',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/reading/recommended
   * Get i+1 recommended content for user
   */
  static async recommended(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }
      const query = recommendedQuerySchema.parse({ limit: req.query.limit });

      const items = await readingService.getRecommended(
        userId,
        query.limit
      );

      return res.status(200).json({
        success: true,
        data: items,
        count: items.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid recommended query payload',
            details: error.issues,
          },
        });
      }
      console.error('Error fetching recommended content:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch recommended content',
        },
      });
    }
  }

  /**
   * GET /api/reading/featured
   * Get featured content
   */
  static async featured(req: Request, res: Response) {
    try {
      const { limit } = req.query;
      const items = await readingService.getFeatured(
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
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/reading/stats
   * Get reading statistics
   */
  static async stats(req: Request, res: Response) {
    try {
      const stats = await readingService.getStats();
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching reading stats:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/reading/levels
   * Get available levels
   */
  static async levels(req: Request, res: Response) {
    try {
      const levels = await readingService.getLevels();
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
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/reading/topics
   * Get available topics
   */
  static async topics(req: Request, res: Response) {
    try {
      const { level } = req.query;
      const topics = await readingService.getTopics(level as string);
      return res.status(200).json({
        success: true,
        data: topics,
        count: topics.length,
      });
    } catch (error) {
      console.error('Error fetching topics:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch topics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/reading/:id
   * Get single reading content
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
        content = await readingService.getWithAnalysis(id, userId);
      } else {
        content = await readingService.getById(id);
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
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Progress Endpoints
  // ═══════════════════════════════════════════════════════════════

  /**
   * POST /api/reading/:id/start
   * Start reading content
   */
  static async startReading(req: Request, res: Response) {
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

      const progress = await readingService.startReading(userId, id);
      return res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      console.error('Error starting reading:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to start reading',
        },
      });
    }
  }

  /**
   * PUT /api/reading/:id/progress
   * Update reading progress
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

      const progress = await readingService.updateProgress(userId, id, {
        progressPercent: payload.progressPercent,
        lastPosition: payload.lastPosition,
        wordsRead: payload.wordsRead,
        totalReadTime: payload.totalReadTime,
        wordsLookedUp: payload.wordsLookedUp,
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
            message: 'Invalid reading progress payload',
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
   * POST /api/reading/:id/complete
   * Mark reading as completed
   */
  static async completeReading(req: Request, res: Response) {
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

      const payload = completeReadingSchema.parse(req.body);

      const progress = await readingService.completeReading(userId, id, payload.rating);
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
            message: 'Invalid reading completion payload',
            details: error.issues,
          },
        });
      }
      console.error('Error completing reading:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to complete reading',
        },
      });
    }
  }

  /**
   * GET /api/reading/user/:userId/history
   * Get user's reading history
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
            message: 'Invalid reading history status filter',
          },
        });
      }

      const history = await readingService.getUserHistory(
        userId,
        status as 'not_started' | 'in_progress' | 'completed' | undefined
      );

      return res.status(200).json({
        success: true,
        data: history,
        count: history.length,
      });
    } catch (error) {
      console.error('Error fetching user history:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user history',
        },
      });
    }
  }

  /**
   * GET /api/reading/user/:userId/stats
   * Get user's reading statistics
   */
  static async getUserStats(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }
      const stats = await readingService.getUserStats(userId);

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
  // Content Management (Admin)
  // ═══════════════════════════════════════════════════════════════

  /**
   * POST /api/reading/generate
   * Generate new content using AI
   */
  static async generateContent(req: Request, res: Response) {
    try {
      const { level, topic, targetWordCount, style, includeVocabulary } = req.body;

      if (!level || !topic) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: level, topic',
        });
      }

      const contentId = await readingService.generateContent({
        level,
        topic,
        targetWordCount: targetWordCount || 200,
        style,
        includeVocabulary,
      });

      return res.status(201).json({
        success: true,
        data: { id: contentId },
        message: 'Content generated successfully',
      });
    } catch (error) {
      console.error('Error generating content:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate content',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /api/reading
   * Create new content manually
   */
  static async createContent(req: Request, res: Response) {
    try {
      const { title, content, summary, level, topic, source, author, imageUrl } = req.body;

      if (!title || !content || !level) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title, content, level',
        });
      }

      const created = await readingService.createContent({
        title,
        content,
        summary,
        level,
        topic,
        source,
        author,
        imageUrl,
      });

      return res.status(201).json({
        success: true,
        data: created,
      });
    } catch (error) {
      console.error('Error creating content:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create content',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * DELETE /api/reading/:id
   * Delete content
   */
  static async deleteContent(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing content id',
        });
      }
      const success = await readingService.deleteContent(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Content not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Content deleted',
      });
    } catch (error) {
      console.error('Error deleting content:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete content',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /api/reading/seed
   * Seed sample reading content
   */
  static async seedContent(req: Request, res: Response) {
    try {
      const count = await readingService.seedContent();

      return res.status(201).json({
        success: true,
        data: { count },
        message: `Seeded ${count} reading content items`,
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
