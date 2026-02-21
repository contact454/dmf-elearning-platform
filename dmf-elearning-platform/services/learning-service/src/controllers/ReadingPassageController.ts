import { Request, Response } from 'express';
import { z } from 'zod';
import { ReadingPassageService } from '../services/ReadingPassageService';

const readingPassageService = new ReadingPassageService();

const saveVocabularySchema = z.object({
  passageId: z.string().trim().min(1),
  word: z.string().trim().min(1),
  translation: z.string().trim().min(1),
  context: z.string().trim().min(1).optional(),
  sentence: z.string().trim().min(1).optional(),
});

const submitAnswerSchema = z.object({
  passageId: z.string().trim().min(1),
  exerciseId: z.string().trim().min(1),
  userAnswer: z.unknown(),
  timeSpentSeconds: z.number().int().min(0).optional().default(0),
});

const progressQuerySchema = z.object({
  passageId: z.string().trim().min(1).optional(),
});

const listPassagesQuerySchema = z.object({
  level: z.string().trim().min(1).optional(),
  topic: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const passageByIdSchema = z.object({
  id: z.string().trim().min(1),
  userId: z.string().trim().min(1).optional(),
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

export class ReadingPassageController {
  // ═══════════════════════════════════════════════════════════════
  // 1. GET /api/reading/passages
  // Fetch passages with filters
  // ═══════════════════════════════════════════════════════════════
  
  static async getPassages(req: Request, res: Response) {
    try {
      const query = listPassagesQuerySchema.parse({
        level: asString(req.query.level),
        topic: asString(req.query.topic),
        search: asString(req.query.search),
        limit: asString(req.query.limit),
        offset: asString(req.query.offset),
      });

      const result = await readingPassageService.getPassages({
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
        return sendValidationError(res, 'Invalid reading passages query', error.issues);
      }

      console.error('Error fetching passages:', error);
      return sendInternalError(res, 'Failed to fetch passages');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 2. GET /api/reading/passages/:id
  // Get single passage with exercises
  // ═══════════════════════════════════════════════════════════════
  
  static async getPassageById(req: Request, res: Response) {
    try {
      const params = passageByIdSchema.parse({
        id: asString(req.params.id),
        userId: asString(req.query.userId),
      });

      const passage = await readingPassageService.getPassageById(
        params.id,
        params.userId
      );

      if (!passage) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PASSAGE_NOT_FOUND',
            message: 'Passage not found',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: passage,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid passage lookup input', error.issues);
      }

      console.error('Error fetching passage:', error);
      return sendInternalError(res, 'Failed to fetch passage');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 3. POST /api/reading/submit
  // Submit exercise answer with validation
  // ═══════════════════════════════════════════════════════════════
  
  static async submitAnswer(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }
      const payload = submitAnswerSchema.parse(req.body);

      const result = await readingPassageService.submitAnswer({
        userId,
        passageId: payload.passageId,
        exerciseId: payload.exerciseId,
        userAnswer: payload.userAnswer,
        timeSpentSeconds: payload.timeSpentSeconds,
      });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid reading submit payload', error.issues);
      }

      console.error('Error submitting answer:', error);
      
      // Handle specific errors
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'EXERCISE_NOT_FOUND',
            message: 'Exercise not found',
            details: error.message,
          },
        });
      }

      return sendInternalError(res, 'Failed to submit answer');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 4. GET /api/reading/progress
  // Get user reading progress
  // ═══════════════════════════════════════════════════════════════
  
  static async getProgress(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }
      const query = progressQuerySchema.parse({
        passageId: asString(req.query.passageId),
      });

      const progress = await readingPassageService.getUserProgress(
        userId,
        query.passageId
      );

      return res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid reading progress query', error.issues);
      }

      console.error('Error fetching progress:', error);
      return sendInternalError(res, 'Failed to fetch progress');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 5. POST /api/reading/vocabulary/save
  // Save vocabulary word for SRS
  // ═══════════════════════════════════════════════════════════════
  
  static async saveVocabulary(req: Request, res: Response) {
    try {
      const parsed = saveVocabularySchema.parse(req.body);
      const userId = getAuthenticatedUserId(req, res);

      if (!userId) {
        return;
      }

      const result = await readingPassageService.saveVocabulary({
        userId,
        passageId: parsed.passageId,
        word: parsed.word,
        translation: parsed.translation,
        context: parsed.context,
        sentence: parsed.sentence,
      });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid vocabulary save payload', error.issues);
      }

      console.error('Error saving vocabulary:', error);
      return sendInternalError(res, 'Failed to save vocabulary');
    }
  }
}
