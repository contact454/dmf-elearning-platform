import { Request, Response } from 'express';
import { HubService } from '../services/HubService';

export class HubController {
  /**
   * GET /api/hub/:userId
   * Get comprehensive hub data for a user
   */
  static async getHubData(req: Request, res: Response) {
    try {
      const { userId } = req.params;

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
      const { userId } = req.params;

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
      const { userId } = req.params;

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
   * GET /api/hub/:userId/recommendation
   * Get recommended next activity
   */
  static async getRecommendation(req: Request, res: Response) {
    try {
      const { userId } = req.params;

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
