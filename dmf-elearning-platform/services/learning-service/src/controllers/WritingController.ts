import { Request, Response } from 'express';
import { z } from 'zod';
import { WritingService } from '../services/WritingService';

const writingService = new WritingService();

const submitWritingSchema = z.object({
  content: z.string().trim().min(1),
  answers: z.unknown().optional(),
  timeSpent: z.number().int().min(0).optional(),
});

const saveDraftSchema = z.object({
  content: z.string(),
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

const idLookupSchema = z.object({
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
  instructions: z.string().trim().optional(),
  instructionsVi: z.string().trim().optional(),
  sampleResponse: z.string().trim().optional(),
  sampleResponseVi: z.string().trim().optional(),
  keywords: z.array(z.string().trim().min(1)).optional(),
  grammarPoints: z.array(z.string().trim().min(1)).optional(),
  minWords: z.coerce.number().int().min(0).optional(),
  wordLimit: z.coerce.number().int().min(1).optional(),
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

export class WritingController {
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

      const result = await writingService.getPrompts({
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
        return sendValidationError(res, 'Invalid writing list query', error.issues);
      }
      console.error('Error listing writing prompts:', error);
      return sendInternalError(res, 'Failed to fetch writing prompts');
    }
  }

  static async featured(req: Request, res: Response) {
    try {
      const query = featuredQuerySchema.parse({ limit: asString(req.query.limit) });
      const items = await writingService.getFeatured(query.limit);

      return res.status(200).json({
        success: true,
        data: items,
        count: items.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid writing featured query', error.issues);
      }
      console.error('Error fetching featured prompts:', error);
      return sendInternalError(res, 'Failed to fetch featured prompts');
    }
  }

  static async stats(req: Request, res: Response) {
    try {
      const stats = await writingService.getStats();
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
      const levels = await writingService.getLevels();
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
      const categories = await writingService.getCategories();
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
        ? await writingService.getWithProgress(params.id, params.userId)
        : await writingService.getById(params.id);

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
        return sendValidationError(res, 'Invalid writing prompt lookup input', error.issues);
      }
      console.error('Error fetching prompt:', error);
      return sendInternalError(res, 'Failed to fetch prompt');
    }
  }

  static async submitWriting(req: Request, res: Response) {
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
      const payload = submitWritingSchema.parse(req.body);

      const submission = await writingService.submitWriting(id, userId, {
        content: payload.content,
        answers: payload.answers,
        timeSpent: payload.timeSpent,
      });

      return res.status(201).json({
        success: true,
        data: submission,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid writing submission payload', error.issues);
      }
      console.error('Error submitting writing:', error);
      return sendInternalError(res, 'Failed to submit writing');
    }
  }

  static async getSubmissions(req: Request, res: Response) {
    try {
      const params = idLookupSchema.parse({
        id: asString(req.params.id),
      });
      const userId = getAuthenticatedUserId(req, res);

      if (!userId) {
        return;
      }

      const submissions = await writingService.getUserSubmissions(userId, params.id);

      return res.status(200).json({
        success: true,
        data: submissions,
        count: submissions.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid writing submissions lookup input', error.issues);
      }
      console.error('Error fetching submissions:', error);
      return sendInternalError(res, 'Failed to fetch submissions');
    }
  }

  static async saveDraft(req: Request, res: Response) {
    try {
      const params = idLookupSchema.parse({
        id: asString(req.params.id),
      });
      const userId = getAuthenticatedUserId(req, res);

      if (!userId) {
        return;
      }

      const payload = saveDraftSchema.parse(req.body);
      const progress = await writingService.saveDraft(userId, params.id, payload.content);

      return res.status(200).json({
        success: true,
        data: progress,
        message: 'Draft saved',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid writing draft payload', error.issues);
      }
      console.error('Error saving draft:', error);
      return sendInternalError(res, 'Failed to save draft');
    }
  }

  static async getDraft(req: Request, res: Response) {
    try {
      const params = idLookupSchema.parse({
        id: asString(req.params.id),
      });
      const userId = getAuthenticatedUserId(req, res);

      if (!userId) {
        return;
      }

      const draft = await writingService.getDraft(userId, params.id);

      return res.status(200).json({
        success: true,
        data: { content: draft },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid writing draft lookup input', error.issues);
      }
      console.error('Error fetching draft:', error);
      return sendInternalError(res, 'Failed to fetch draft');
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

      const history = await writingService.getUserHistory(userId, query.status);

      return res.status(200).json({
        success: true,
        data: history,
        count: history.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid writing history query', error.issues);
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
      const stats = await writingService.getUserStats(userId);

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

      const prompt = await writingService.createPrompt({
        title: payload.title,
        level: payload.level,
        category: payload.category,
        topic: payload.topic,
        promptText: payload.promptText,
        promptTextVi: payload.promptTextVi,
        instructions: payload.instructions,
        instructionsVi: payload.instructionsVi,
        sampleResponse: payload.sampleResponse,
        sampleResponseVi: payload.sampleResponseVi,
        keywords: payload.keywords,
        grammarPoints: payload.grammarPoints,
        minWords: payload.minWords,
        wordLimit: payload.wordLimit,
        difficulty: payload.difficulty,
      });

      return res.status(201).json({
        success: true,
        data: prompt,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendValidationError(res, 'Invalid writing prompt payload', error.issues);
      }
      console.error('Error creating prompt:', error);
      return sendInternalError(res, 'Failed to create prompt');
    }
  }

  static async seedPrompts(req: Request, res: Response) {
    try {
      const created = await writingService.seedPrompts();

      return res.status(200).json({
        success: true,
        message: `Created ${created} sample prompts`,
        count: created,
      });
    } catch (error) {
      console.error('Error seeding prompts:', error);
      return sendInternalError(res, 'Failed to seed prompts');
    }
  }
}
