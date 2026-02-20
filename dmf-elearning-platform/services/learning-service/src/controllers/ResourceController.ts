import { Request, Response } from 'express';
import { z } from 'zod';
import { ResourceService } from '../services/ResourceService';

const resourceService = new ResourceService();

const levelParamSchema = z.object({
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
});

const topicParamSchema = z.object({
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  topic: z.string().trim().min(1),
});

const clearCacheSchema = z.object({
  key: z.string().trim().min(1).optional(),
});

function validationError(res: Response, message: string, details?: unknown) {
  return res.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message,
      details,
    },
  });
}

function notFoundError(res: Response, message: string) {
  return res.status(404).json({
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message,
    },
  });
}

function internalError(res: Response, message: string) {
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  });
}

export class ResourceController {
  /**
   * GET /api/resources/levels
   * Get list of available CEFR levels (A1, A2, B1, B2, C1, C2)
   */
  static async getLevels(req: Request, res: Response) {
    try {
      const levels = await resourceService.getLevels();

      return res.status(200).json({
        success: true,
        data: {
          levels,
          count: levels.length
        }
      });
    } catch (error) {
      console.error('Error fetching levels:', error);
      return internalError(res, 'Failed to fetch levels');
    }
  }

  /**
   * GET /api/resources/:level/topics
   * Get list of topics for a specific level
   */
  static async getTopics(req: Request, res: Response) {
    try {
      const { level } = levelParamSchema.parse(req.params);

      const topics = await resourceService.getTopics(level);

      return res.status(200).json({
        success: true,
        data: {
          level,
          topics,
          count: topics.length
        }
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return validationError(res, 'Invalid level parameter', error.issues);
      }
      if (error instanceof Error && error.message.includes('not found')) {
        return notFoundError(res, error.message);
      }

      console.error('Error fetching topics:', error);
      return internalError(res, 'Failed to fetch topics');
    }
  }

  /**
   * GET /api/resources/:level/:topic
   * Get vocabulary data for a specific level and topic
   */
  static async getTopicData(req: Request, res: Response) {
    try {
      const { level, topic } = topicParamSchema.parse(req.params);

      const topicData = await resourceService.getTopicData(level, topic);

      return res.status(200).json({
        success: true,
        data: topicData
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return validationError(res, 'Invalid level/topic parameters', error.issues);
      }
      if (error instanceof Error && error.message.includes('not found')) {
        return notFoundError(res, error.message);
      }

      console.error('Error fetching topic data:', error);
      return internalError(res, 'Failed to fetch topic data');
    }
  }

  /**
   * GET /api/resources/:level/summary
   * Get summary statistics for a level
   */
  static async getLevelSummary(req: Request, res: Response) {
    try {
      const { level } = levelParamSchema.parse(req.params);

      const summary = await resourceService.getLevelSummary(level);

      return res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return validationError(res, 'Invalid level parameter', error.issues);
      }
      if (error instanceof Error && error.message.includes('not found')) {
        return notFoundError(res, error.message);
      }

      console.error('Error fetching level summary:', error);
      return internalError(res, 'Failed to fetch level summary');
    }
  }

  /**
   * POST /api/resources/cache/clear
   * Clear cache (admin endpoint)
   */
  static async clearCache(req: Request, res: Response) {
    try {
      const payload = clearCacheSchema.parse(req.body ?? {});
      const key = payload.key;
      resourceService.clearCache(key);

      return res.status(200).json({
        success: true,
        message: key ? `Cache cleared for key: ${key}` : 'All cache cleared'
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return validationError(res, 'Invalid clear-cache payload', error.issues);
      }
      console.error('Error clearing cache:', error);
      return internalError(res, 'Failed to clear cache');
    }
  }
}
