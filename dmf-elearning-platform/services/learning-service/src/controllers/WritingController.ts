import { Request, Response } from 'express';
import { WritingService } from '../services/WritingService';

const writingService = new WritingService();

export class WritingController {
  // ═══════════════════════════════════════════════════════════════
  // Prompt Endpoints
  // ═══════════════════════════════════════════════════════════════

  /**
   * GET /api/writing
   * List writing prompts
   */
  static async list(req: Request, res: Response) {
    try {
      const { level, category, topic, search, limit, offset } = req.query;

      const result = await writingService.getPrompts({
        level: level as string,
        category: category as string,
        topic: topic as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : 20,
        offset: offset ? parseInt(offset as string, 10) : 0,
      });

      return res.status(200).json({
        success: true,
        data: result.items,
        pagination: {
          total: result.total,
          limit: limit ? parseInt(limit as string, 10) : 20,
          offset: offset ? parseInt(offset as string, 10) : 0,
        },
      });
    } catch (error) {
      console.error('Error listing writing prompts:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch writing prompts',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/writing/featured
   */
  static async featured(req: Request, res: Response) {
    try {
      const { limit } = req.query;
      const items = await writingService.getFeatured(
        limit ? parseInt(limit as string, 10) : 5
      );

      return res.status(200).json({
        success: true,
        data: items,
        count: items.length,
      });
    } catch (error) {
      console.error('Error fetching featured prompts:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch featured prompts',
      });
    }
  }

  /**
   * GET /api/writing/stats
   */
  static async stats(req: Request, res: Response) {
    try {
      const stats = await writingService.getStats();
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics',
      });
    }
  }

  /**
   * GET /api/writing/levels
   */
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
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch levels',
      });
    }
  }

  /**
   * GET /api/writing/categories
   */
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
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch categories',
      });
    }
  }

  /**
   * GET /api/writing/:id
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      let prompt;
      if (userId) {
        prompt = await writingService.getWithProgress(id, userId as string);
      } else {
        prompt = await writingService.getById(id);
      }

      if (!prompt) {
        return res.status(404).json({
          success: false,
          error: 'Prompt not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: prompt,
      });
    } catch (error) {
      console.error('Error fetching prompt:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch prompt',
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Submission Endpoints
  // ═══════════════════════════════════════════════════════════════

  /**
   * POST /api/writing/:id/submit
   */
  static async submitWriting(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId, content, answers, timeSpent } = req.body;

      if (!userId || !content) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, content',
        });
      }

      const submission = await writingService.submitWriting(id, userId, {
        content,
        answers,
        timeSpent,
      });

      return res.status(201).json({
        success: true,
        data: submission,
      });
    } catch (error) {
      console.error('Error submitting writing:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to submit writing',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/writing/:id/submissions
   */
  static async getSubmissions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing userId query parameter',
        });
      }

      const submissions = await writingService.getUserSubmissions(userId as string, id);

      return res.status(200).json({
        success: true,
        data: submissions,
        count: submissions.length,
      });
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch submissions',
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Draft Endpoints
  // ═══════════════════════════════════════════════════════════════

  /**
   * POST /api/writing/:id/draft
   * Save draft
   */
  static async saveDraft(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId, content } = req.body;

      if (!userId || content === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, content',
        });
      }

      const progress = await writingService.saveDraft(userId, id, content);

      return res.status(200).json({
        success: true,
        data: progress,
        message: 'Draft saved',
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to save draft',
      });
    }
  }

  /**
   * GET /api/writing/:id/draft
   * Get draft
   */
  static async getDraft(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing userId query parameter',
        });
      }

      const draft = await writingService.getDraft(userId as string, id);

      return res.status(200).json({
        success: true,
        data: { content: draft },
      });
    } catch (error) {
      console.error('Error fetching draft:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch draft',
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // User Progress Endpoints
  // ═══════════════════════════════════════════════════════════════

  /**
   * GET /api/writing/user/:userId/history
   */
  static async getUserHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { status } = req.query;

      const history = await writingService.getUserHistory(userId, status as string);

      return res.status(200).json({
        success: true,
        data: history,
        count: history.length,
      });
    } catch (error) {
      console.error('Error fetching history:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch history',
      });
    }
  }

  /**
   * GET /api/writing/user/:userId/stats
   */
  static async getUserStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const stats = await writingService.getUserStats(userId);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user stats',
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Content Management
  // ═══════════════════════════════════════════════════════════════

  /**
   * POST /api/writing
   */
  static async createPrompt(req: Request, res: Response) {
    try {
      const {
        title,
        level,
        category,
        topic,
        promptText,
        promptTextVi,
        instructions,
        instructionsVi,
        sampleResponse,
        sampleResponseVi,
        keywords,
        grammarPoints,
        minWords,
        wordLimit,
        difficulty,
      } = req.body;

      if (!title || !level || !promptText) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title, level, promptText',
        });
      }

      const prompt = await writingService.createPrompt({
        title,
        level,
        category,
        topic,
        promptText,
        promptTextVi,
        instructions,
        instructionsVi,
        sampleResponse,
        sampleResponseVi,
        keywords,
        grammarPoints,
        minWords,
        wordLimit,
        difficulty,
      });

      return res.status(201).json({
        success: true,
        data: prompt,
      });
    } catch (error) {
      console.error('Error creating prompt:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create prompt',
      });
    }
  }

  /**
   * POST /api/writing/seed
   * Seed sample prompts
   */
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
      return res.status(500).json({
        success: false,
        error: 'Failed to seed prompts',
      });
    }
  }
}
