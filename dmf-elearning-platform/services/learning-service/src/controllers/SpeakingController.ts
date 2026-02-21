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

const listPromptsQuerySchema = z.object({
  level: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  topic: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const featuredQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(5),
});

const promptLookupSchema = z.object({
  id: z.string().trim().min(1),
  userId: z.string().trim().min(1).optional(),
});

const attemptsLookupSchema = z.object({
  id: z.string().trim().min(1),
});

const historyQuerySchema = z.object({
  status: z.enum(['attempted', 'mastered']).optional(),
});

const createPromptSchema = z.object({
  title: z.string().trim().min(1),
  level: z.string().trim().min(1),
  category: z.string().trim().optional(),
  topic: z.string().trim().optional(),
  promptText: z.string().trim().min(1),
  promptTextVi: z.string().trim().optional(),
  sampleResponse: z.string().trim().optional(),
  sampleAudioUrl: z.string().trim().optional(),
  targetWords: z.array(z.string().trim().min(1)).optional(),
  difficulty: z.coerce.number().int().min(1).max(5).optional(),
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

export class SpeakingController {
  static async list(req: Request, res: Response) {
    try {
      const query = listPromptsQuerySchema.parse({
        level: asString(req.query.level),
        category: asString(req.query.category),
        topic: asString(req.query.topic),
        search: asString(req.query.search),
        limit: asString(req.query.limit),
        offset: asString(req.query.offset),
      });

      const result = await speakingService.getPrompts({
        level: query.level,
        category: query.category,
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
        return sendValidationError(res, 'Invalid speaking list query', error.issues);
      }
      console.error('Error listing speaking prompts:', error);
      return sendInternalError(res, 'Failed to fetch speaking prompts');
    }
  }

  static async featured(req: Request, res: Response) {
    try {
      const query = featuredQuerySchema.parse({ limit: asString(req.query.limit) });
      const items = await speakingService.getFeatured(query.limit);

      return res.status(200).json({
        success: true,
        data: items,
        count: items.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid speaking featured query', error.issues);
      }
      console.error('Error fetching featured prompts:', error);
      return sendInternalError(res, 'Failed to fetch featured prompts');
    }
  }

  static async stats(req: Request, res: Response) {
    try {
      const stats = await speakingService.getStats();
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      return sendInternalError(res, 'Failed to fetch statistics');
    }
  }

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
      return sendInternalError(res, 'Failed to fetch levels');
    }
  }

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
      return sendInternalError(res, 'Failed to fetch categories');
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const params = promptLookupSchema.parse({
        id: asString(req.params.id),
        userId: asString(req.query.userId),
      });

      const prompt = params.userId
        ? await speakingService.getWithProgress(params.id, params.userId)
        : await speakingService.getById(params.id);

      if (!prompt) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PROMPT_NOT_FOUND',
            message: 'Prompt not found',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: prompt,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid speaking prompt lookup input', error.issues);
      }
      console.error('Error fetching prompt:', error);
      return sendInternalError(res, 'Failed to fetch prompt');
    }
  }

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
        return sendValidationError(res, 'Invalid speaking attempt payload', error.issues);
      }
      console.error('Error submitting attempt:', error);
      return sendInternalError(res, 'Failed to submit attempt');
    }
  }

  static async getAttempts(req: Request, res: Response) {
    try {
      const params = attemptsLookupSchema.parse({
        id: asString(req.params.id),
      });
      const userId = getAuthenticatedUserId(req, res);

      if (!userId) {
        return;
      }

      const attempts = await speakingService.getUserAttempts(userId, params.id);

      return res.status(200).json({
        success: true,
        data: attempts,
        count: attempts.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid speaking attempts lookup input', error.issues);
      }
      console.error('Error fetching attempts:', error);
      return sendInternalError(res, 'Failed to fetch attempts');
    }
  }

  static async getUserHistory(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req, res);
      const query = historyQuerySchema.parse({
        status: asString(req.query.status),
      });

      if (!userId) {
        return;
      }

      const history = await speakingService.getUserHistory(userId, query.status);

      return res.status(200).json({
        success: true,
        data: history,
        count: history.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid speaking history query', error.issues);
      }
      console.error('Error fetching history:', error);
      return sendInternalError(res, 'Failed to fetch history');
    }
  }

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
      return sendInternalError(res, 'Failed to fetch user stats');
    }
  }

  static async createPrompt(req: Request, res: Response) {
    try {
      const payload = createPromptSchema.parse(req.body);

      const prompt = await speakingService.createPrompt({
        title: payload.title,
        level: payload.level,
        category: payload.category,
        topic: payload.topic,
        promptText: payload.promptText,
        promptTextVi: payload.promptTextVi,
        sampleResponse: payload.sampleResponse,
        sampleAudioUrl: payload.sampleAudioUrl,
        targetWords: payload.targetWords,
        difficulty: payload.difficulty,
      });

      return res.status(201).json({
        success: true,
        data: prompt,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid speaking prompt payload', error.issues);
      }
      console.error('Error creating prompt:', error);
      return sendInternalError(res, 'Failed to create prompt');
    }
  }

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
      return sendInternalError(res, 'Failed to seed content');
    }
  }
}
