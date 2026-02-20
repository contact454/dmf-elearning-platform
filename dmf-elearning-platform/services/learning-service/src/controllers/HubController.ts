import { Request, Response } from 'express';
import { z } from 'zod';
import { HubService } from '../services/HubService';

const updateDailyGoalsSchema = z
  .object({
    vocabulary: z.number().int().min(1).max(200).optional(),
    reading: z.number().int().min(1).max(200).optional(),
    listening: z.number().int().min(1).max(200).optional(),
  })
  .refine(
    (value) =>
      value.vocabulary !== undefined || value.reading !== undefined || value.listening !== undefined,
    { message: 'At least one goal field is required' }
  );

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

function internalError(res: Response, message: string) {
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  });
}

export class HubController {
  /**
   * GET /api/hub/:userId
   * Get comprehensive hub data for a user
   */
  static async getHubData(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }

      const data = await HubService.getHubData(userId);

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Error getting hub data:', error);
      return internalError(res, 'Failed to get hub data');
    }
  }

  /**
   * GET /api/hub/:userId/skills
   * Get skill progress only
   */
  static async getSkillProgress(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }

      const data = await HubService.getHubData(userId);

      return res.json({
        success: true,
        data: data.skillProgress,
      });
    } catch (error) {
      console.error('Error getting skill progress:', error);
      return internalError(res, 'Failed to get skill progress');
    }
  }

  /**
   * GET /api/hub/:userId/daily-goals
   * Get daily goals with progress
   */
  static async getDailyGoals(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }

      const data = await HubService.getHubData(userId);

      return res.json({
        success: true,
        data: data.dailyGoals,
      });
    } catch (error) {
      console.error('Error getting daily goals:', error);
      return internalError(res, 'Failed to get daily goals');
    }
  }

  /**
   * PATCH /api/hub/:userId/daily-goals
   * Update daily goal targets for a user
   */
  static async updateDailyGoals(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }

      const updates = updateDailyGoalsSchema.parse(req.body);

      const dailyGoals = await HubService.updateDailyGoals(userId, updates);

      return res.json({
        success: true,
        data: dailyGoals,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationError(res, 'Invalid daily goals payload', error.issues);
      }
      console.error('Error updating daily goals:', error);
      return internalError(res, 'Failed to update daily goals');
    }
  }

  /**
   * GET /api/hub/:userId/recommendation
   * Get recommended next activity
   */
  static async getRecommendation(req: Request, res: Response) {
    try {
      const userId = getAuthenticatedUserId(req, res);
      if (!userId) {
        return;
      }

      const data = await HubService.getHubData(userId);

      return res.json({
        success: true,
        data: data.recommendedActivity,
      });
    } catch (error) {
      console.error('Error getting recommendation:', error);
      return internalError(res, 'Failed to get recommendation');
    }
  }
}
