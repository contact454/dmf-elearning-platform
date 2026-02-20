import { Request, Response } from 'express';
import { HubService } from '../services/HubService';

function asString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
}

export class HubController {
  /**
   * GET /api/hub/:userId
   * Get comprehensive hub data for a user
   */
  static async getHubData(req: Request, res: Response) {
    try {
      const userId = asString(req.params.userId);

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
      }

      const data = await HubService.getHubData(userId);

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Error getting hub data:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get hub data',
      });
    }
  }

  /**
   * GET /api/hub/:userId/skills
   * Get skill progress only
   */
  static async getSkillProgress(req: Request, res: Response) {
    try {
      const userId = asString(req.params.userId);

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
      }

      const data = await HubService.getHubData(userId);

      return res.json({
        success: true,
        data: data.skillProgress,
      });
    } catch (error) {
      console.error('Error getting skill progress:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get skill progress',
      });
    }
  }

  /**
   * GET /api/hub/:userId/daily-goals
   * Get daily goals with progress
   */
  static async getDailyGoals(req: Request, res: Response) {
    try {
      const userId = asString(req.params.userId);

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
      }

      const data = await HubService.getHubData(userId);

      return res.json({
        success: true,
        data: data.dailyGoals,
      });
    } catch (error) {
      console.error('Error getting daily goals:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get daily goals',
      });
    }
  }

  /**
   * PATCH /api/hub/:userId/daily-goals
   * Update daily goal targets for a user
   */
  static async updateDailyGoals(req: Request, res: Response) {
    try {
      const userId = asString(req.params.userId);

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
      }

      const body = req.body as {
        vocabulary?: unknown;
        reading?: unknown;
        listening?: unknown;
      };

      const parseGoal = (value: unknown): number | undefined => {
        if (value === undefined) return undefined;
        if (typeof value !== 'number') return Number.NaN;
        if (!Number.isInteger(value)) return Number.NaN;
        return value;
      };

      const updates = {
        vocabulary: parseGoal(body?.vocabulary),
        reading: parseGoal(body?.reading),
        listening: parseGoal(body?.listening),
      };

      const hasAnyUpdate =
        updates.vocabulary !== undefined ||
        updates.reading !== undefined ||
        updates.listening !== undefined;

      if (!hasAnyUpdate) {
        return res.status(400).json({
          success: false,
          error: 'At least one goal field is required',
        });
      }

      const values = [updates.vocabulary, updates.reading, updates.listening].filter(
        (value): value is number => value !== undefined
      );
      const hasInvalidValue = values.some((value) => Number.isNaN(value) || value < 1 || value > 200);

      if (hasInvalidValue) {
        return res.status(400).json({
          success: false,
          error: 'Goal values must be integer numbers between 1 and 200',
        });
      }

      const dailyGoals = await HubService.updateDailyGoals(userId, updates);

      return res.json({
        success: true,
        data: dailyGoals,
      });
    } catch (error) {
      console.error('Error updating daily goals:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update daily goals',
      });
    }
  }

  /**
   * GET /api/hub/:userId/recommendation
   * Get recommended next activity
   */
  static async getRecommendation(req: Request, res: Response) {
    try {
      const userId = asString(req.params.userId);

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
      }

      const data = await HubService.getHubData(userId);

      return res.json({
        success: true,
        data: data.recommendedActivity,
      });
    } catch (error) {
      console.error('Error getting recommendation:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get recommendation',
      });
    }
  }
}
