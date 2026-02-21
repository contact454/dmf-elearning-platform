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

const readingListQuerySchema = z.object({
  level: z.string().trim().min(1).optional(),
  topic: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const featuredQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(5),
});

const topicsQuerySchema = z.object({
  level: z.string().trim().min(1).optional(),
});

const readingLookupSchema = z.object({
  id: z.string().trim().min(1),
  userId: z.string().trim().min(1).optional(),
});

const generateContentSchema = z.object({
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  topic: z.string().trim().min(1),
  targetWordCount: z.coerce.number().int().min(50).max(5000).optional().default(200),
  style: z.enum(['story', 'article', 'dialogue', 'description']).optional(),
  includeVocabulary: z.array(z.string().trim().min(1)).optional(),
});

const createContentSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
  summary: z.string().trim().optional(),
  level: z.string().trim().min(1),
  topic: z.string().trim().optional(),
  source: z.string().trim().optional(),
  author: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
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
      const query = readingListQuerySchema.parse({
        level: asString(req.query.level),
        topic: asString(req.query.topic),
        search: asString(req.query.search),
        limit: asString(req.query.limit),
        offset: asString(req.query.offset),
      });

      const result = await readingService.getContent({
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
        return sendValidationError(res, 'Invalid reading list query', error.issues);
      }

      console.error('Error listing reading content:', error);
      return sendInternalError(res, 'Failed to fetch reading content');
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
        return sendValidationError(res, 'Invalid recommended query payload', error.issues);
      }
      console.error('Error fetching recommended content:', error);
      return sendInternalError(res, 'Failed to fetch recommended content');
    }
  }

  /**
   * GET /api/reading/featured
   * Get featured content
   */
  static async featured(req: Request, res: Response) {
    try {
      const query = featuredQuerySchema.parse({
        limit: asString(req.query.limit),
      });
      const items = await readingService.getFeatured(query.limit);

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
      return sendInternalError(res, 'Failed to fetch statistics');
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
      return sendInternalError(res, 'Failed to fetch levels');
    }
  }

  /**
   * GET /api/reading/topics
   * Get available topics
   */
  static async topics(req: Request, res: Response) {
    try {
      const query = topicsQuerySchema.parse({
        level: asString(req.query.level),
      });
      const topics = await readingService.getTopics(query.level);
      return res.status(200).json({
        success: true,
        data: topics,
        count: topics.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid topics query', error.issues);
      }

      console.error('Error fetching topics:', error);
      return sendInternalError(res, 'Failed to fetch topics');
    }
  }

  /**
   * GET /api/reading/:id
   * Get single reading content
   */
  static async getById(req: Request, res: Response) {
    try {
      const params = readingLookupSchema.parse({
        id: asString(req.params.id),
        userId: asString(req.query.userId),
      });

      let content;
      if (params.userId) {
        content = await readingService.getWithAnalysis(params.id, params.userId);
      } else {
        content = await readingService.getById(params.id);
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
        return sendValidationError(res, 'Invalid reading content lookup', error.issues);
      }

      console.error('Error fetching content:', error);
      return sendInternalError(res, 'Failed to fetch content');
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
        return sendValidationError(res, 'Invalid reading progress payload', error.issues);
      }
      console.error('Error updating progress:', error);
      return sendInternalError(res, 'Failed to update progress');
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
        return sendValidationError(res, 'Invalid reading completion payload', error.issues);
      }
      console.error('Error completing reading:', error);
      return sendInternalError(res, 'Failed to complete reading');
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
      return sendInternalError(res, 'Failed to fetch user history');
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
      return sendInternalError(res, 'Failed to fetch user stats');
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
      const payload = generateContentSchema.parse(req.body);

      const contentId = await readingService.generateContent({
        level: payload.level,
        topic: payload.topic,
        targetWordCount: payload.targetWordCount,
        style: payload.style,
        includeVocabulary: payload.includeVocabulary,
      });

      return res.status(201).json({
        success: true,
        data: { id: contentId },
        message: 'Content generated successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid reading content generation payload', error.issues);
      }

      console.error('Error generating content:', error);
      return sendInternalError(res, 'Failed to generate content');
    }
  }

  /**
   * POST /api/reading
   * Create new content manually
   */
  static async createContent(req: Request, res: Response) {
    try {
      const payload = createContentSchema.parse(req.body);

      const created = await readingService.createContent({
        title: payload.title,
        content: payload.content,
        summary: payload.summary,
        level: payload.level,
        topic: payload.topic,
        source: payload.source,
        author: payload.author,
        imageUrl: payload.imageUrl,
      });

      return res.status(201).json({
        success: true,
        data: created,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid reading content payload', error.issues);
      }

      console.error('Error creating content:', error);
      return sendInternalError(res, 'Failed to create content');
    }
  }

  /**
   * DELETE /api/reading/:id
   * Delete content
   */
  static async deleteContent(req: Request, res: Response) {
    try {
      const params = z.object({ id: z.string().trim().min(1) }).parse({
        id: asString(req.params.id),
      });
      const success = await readingService.deleteContent(params.id);

      if (!success) {
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
        message: 'Content deleted',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid reading content id', error.issues);
      }

      console.error('Error deleting content:', error);
      return sendInternalError(res, 'Failed to delete content');
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
      return sendInternalError(res, 'Failed to seed content');
    }
  }
}
