import { Request, Response } from 'express';
import { ResourceService } from '../services/ResourceService';

const resourceService = new ResourceService();

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
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch levels',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/resources/:level/topics
   * Get list of topics for a specific level
   */
  static async getTopics(req: Request, res: Response) {
    try {
      const level = Array.isArray(req.params.level) ? req.params.level[0] : req.params.level;

      // Validate level format
      if (!/^[ABC][12]$/.test(level)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid level format. Must be A1, A2, B1, B2, C1, or C2'
        });
      }

      const topics = await resourceService.getTopics(level);

      return res.status(200).json({
        success: true,
        data: {
          level,
          topics,
          count: topics.length
        }
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      console.error('Error fetching topics:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch topics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/resources/:level/:topic
   * Get vocabulary data for a specific level and topic
   */
  static async getTopicData(req: Request, res: Response) {
    try {
      const level = Array.isArray(req.params.level) ? req.params.level[0] : req.params.level;
      const topic = Array.isArray(req.params.topic) ? req.params.topic[0] : req.params.topic;

      // Validate level format
      if (!/^[ABC][12]$/.test(level)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid level format. Must be A1, A2, B1, B2, C1, or C2'
        });
      }

      const topicData = await resourceService.getTopicData(level, topic);

      return res.status(200).json({
        success: true,
        data: topicData
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      console.error('Error fetching topic data:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch topic data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/resources/:level/summary
   * Get summary statistics for a level
   */
  static async getLevelSummary(req: Request, res: Response) {
    try {
      const level = Array.isArray(req.params.level) ? req.params.level[0] : req.params.level;

      // Validate level format
      if (!/^[ABC][12]$/.test(level)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid level format. Must be A1, A2, B1, B2, C1, or C2'
        });
      }

      const summary = await resourceService.getLevelSummary(level);

      return res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      console.error('Error fetching level summary:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch level summary',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/resources/cache/clear
   * Clear cache (admin endpoint)
   */
  static async clearCache(req: Request, res: Response) {
    try {
      const { key } = req.body;
      resourceService.clearCache(key);

      return res.status(200).json({
        success: true,
        message: key ? `Cache cleared for key: ${key}` : 'All cache cleared'
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to clear cache',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
