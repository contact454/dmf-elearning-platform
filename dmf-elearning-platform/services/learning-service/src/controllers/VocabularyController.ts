import { Request, Response } from 'express';
import { z } from 'zod';
import { VocabularyService } from '../services/VocabularyService';

const vocabularyService = new VocabularyService();

const listQuerySchema = z.object({
  level: z.string().trim().optional(),
  topic: z.string().trim().optional(),
  pos: z.string().trim().optional(),
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const randomQuerySchema = z.object({
  count: z.coerce.number().int().min(1).max(100).optional().default(10),
  level: z.string().trim().optional(),
});

const topicsQuerySchema = z.object({
  level: z.string().trim().optional(),
});

const deleteManySchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).max(500),
});

const dueCardsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  level: z.string().trim().optional(),
});

const submitReviewSchema = z.object({
  vocabId: z.string().trim().min(1),
  rating: z.number().int().min(0).max(3),
});

const withProgressQuerySchema = z.object({
  level: z.string().trim().optional(),
  topic: z.string().trim().optional(),
  pos: z.string().trim().optional(),
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
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

function sendValidationError(res: Response, message: string, details?: unknown) {
  return res.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message,
      ...(details ? { details } : {}),
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

export class VocabularyController {
  /**
   * GET /api/vocabulary
   * List vocabulary with filters and pagination
   */
  static async list(req: Request, res: Response) {
    try {
      const query = listQuerySchema.parse(req.query);
      const result = await vocabularyService.getVocabulary({
        level: query.level,
        topic: query.topic,
        pos: query.pos,
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
        return sendValidationError(res, 'Invalid vocabulary list query', error.issues);
      }
      console.error('Error listing vocabulary:', error);
      return sendInternalError(res, 'Failed to fetch vocabulary');
    }
  }

  /**
   * GET /api/vocabulary/random
   * Get random vocabulary for flashcard practice
   */
  static async random(req: Request, res: Response) {
    try {
      const query = randomQuerySchema.parse(req.query);
      const items = await vocabularyService.getRandom(query.count, query.level);

      return res.status(200).json({
        success: true,
        data: items,
        count: items.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid random vocabulary query', error.issues);
      }
      console.error('Error fetching random vocabulary:', error);
      return sendInternalError(res, 'Failed to fetch random vocabulary');
    }
  }

  /**
   * GET /api/vocabulary/stats
   * Get vocabulary statistics
   */
  static async stats(req: Request, res: Response) {
    try {
      const stats = await vocabularyService.getStats();

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
   * GET /api/vocabulary/levels
   * Get all available CEFR levels from database
   */
  static async levels(req: Request, res: Response) {
    try {
      const levels = await vocabularyService.getLevels();

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
   * GET /api/vocabulary/topics
   * Get all topics, optionally filtered by level
   */
  static async topics(req: Request, res: Response) {
    try {
      const query = topicsQuerySchema.parse(req.query);
      const topics = await vocabularyService.getTopics(query.level);

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
   * GET /api/vocabulary/:id
   * Get single vocabulary by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      if (!id) {
        return sendValidationError(res, 'Missing vocabulary id');
      }

      const item = await vocabularyService.getById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Vocabulary not found',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      return sendInternalError(res, 'Failed to fetch vocabulary');
    }
  }

  /**
   * GET /api/vocabulary/word/:word
   * Get vocabulary by German word
   */
  static async getByWord(req: Request, res: Response) {
    try {
      const word = asString(req.params.word);
      if (!word) {
        return sendValidationError(res, 'Missing word parameter');
      }

      const item = await vocabularyService.getByWord(word);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Word "${word}" not found`,
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      return sendInternalError(res, 'Failed to fetch vocabulary');
    }
  }

  /**
   * DELETE /api/vocabulary/:id
   * Delete single vocabulary by ID
   */
  static async deleteById(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      if (!id) {
        return sendValidationError(res, 'Missing vocabulary id');
      }

      const success = await vocabularyService.deleteById(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Vocabulary not found',
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Vocabulary deleted',
      });
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      return sendInternalError(res, 'Failed to delete vocabulary');
    }
  }

  /**
   * POST /api/vocabulary/delete-many
   * Delete multiple vocabulary by IDs
   */
  static async deleteMany(req: Request, res: Response) {
    try {
      const payload = deleteManySchema.parse(req.body);
      const deletedCount = await vocabularyService.deleteMany(payload.ids);

      return res.status(200).json({
        success: true,
        deleted: deletedCount,
        message: `Deleted ${deletedCount} vocabulary items`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid delete-many payload', error.issues);
      }
      console.error('Error deleting vocabulary:', error);
      return sendInternalError(res, 'Failed to delete vocabulary');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SRS (Spaced Repetition System) Endpoints
  // ═══════════════════════════════════════════════════════════════

  /**
   * GET /api/vocabulary/srs/due
   * Get vocabulary cards due for review
   */
  static async getDueCards(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }
      const query = dueCardsQuerySchema.parse(req.query);

      const items = await vocabularyService.getDueCards(
        userId,
        query.limit,
        query.level
      );

      return res.status(200).json({
        success: true,
        data: items,
        count: items.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid due-cards query', error.issues);
      }
      console.error('Error fetching due cards:', error);
      return sendInternalError(res, 'Failed to fetch due cards');
    }
  }

  /**
   * POST /api/vocabulary/srs/review
   * Submit a review and update SRS parameters
   */
  static async submitReview(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }
      const payload = submitReviewSchema.parse(req.body);

      const progress = await vocabularyService.submitReview(userId, payload.vocabId, payload.rating);

      return res.status(200).json({
        success: true,
        data: progress,
        message: 'Review submitted successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid review payload', error.issues);
      }
      console.error('Error submitting review:', error);
      return sendInternalError(res, 'Failed to submit review');
    }
  }

  /**
   * GET /api/vocabulary/srs/progress/:userId
   * Get user's learning progress statistics
   */
  static async getUserProgress(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }

      const stats = await vocabularyService.getUserProgress(userId);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return sendInternalError(res, 'Failed to fetch user progress');
    }
  }

  /**
   * GET /api/vocabulary/with-progress
   * Get vocabulary with user progress
   */
  static async listWithProgress(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }
      const query = withProgressQuerySchema.parse(req.query);

      const result = await vocabularyService.getVocabularyWithProgress(
        userId,
        {
          level: query.level,
          topic: query.topic,
          pos: query.pos,
          search: query.search,
          limit: query.limit,
          offset: query.offset,
        }
      );

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
        return sendValidationError(res, 'Invalid vocabulary-with-progress query', error.issues);
      }
      console.error('Error listing vocabulary with progress:', error);
      return sendInternalError(res, 'Failed to fetch vocabulary with progress');
    }
  }
}

