import { Request, Response } from 'express';
import { VocabularyService } from '../services/VocabularyService';

const vocabularyService = new VocabularyService();

export class VocabularyController {
  /**
   * GET /api/vocabulary
   * List vocabulary with filters and pagination
   */
  static async list(req: Request, res: Response) {
    try {
      const { level, topic, pos, search, limit, offset } = req.query;

      const result = await vocabularyService.getVocabulary({
        level: level as string,
        topic: topic as string,
        pos: pos as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : 50,
        offset: offset ? parseInt(offset as string, 10) : 0,
      });

      return res.status(200).json({
        success: true,
        data: result.items,
        pagination: {
          total: result.total,
          limit: limit ? parseInt(limit as string, 10) : 50,
          offset: offset ? parseInt(offset as string, 10) : 0,
        },
      });
    } catch (error) {
      console.error('Error listing vocabulary:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch vocabulary',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/vocabulary/random
   * Get random vocabulary for flashcard practice
   */
  static async random(req: Request, res: Response) {
    try {
      const { count, level } = req.query;
      const items = await vocabularyService.getRandom(
        count ? parseInt(count as string, 10) : 10,
        level as string
      );

      return res.status(200).json({
        success: true,
        data: items,
        count: items.length,
      });
    } catch (error) {
      console.error('Error fetching random vocabulary:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch random vocabulary',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
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
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
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
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch levels',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/vocabulary/topics
   * Get all topics, optionally filtered by level
   */
  static async topics(req: Request, res: Response) {
    try {
      const { level } = req.query;
      const topics = await vocabularyService.getTopics(level as string);

      return res.status(200).json({
        success: true,
        data: topics,
        count: topics.length,
      });
    } catch (error) {
      console.error('Error fetching topics:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch topics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/vocabulary/:id
   * Get single vocabulary by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const item = await vocabularyService.getById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Vocabulary not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch vocabulary',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/vocabulary/word/:word
   * Get vocabulary by German word
   */
  static async getByWord(req: Request, res: Response) {
    try {
      const word = Array.isArray(req.params.word) ? req.params.word[0] : req.params.word;
      const item = await vocabularyService.getByWord(word);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: `Word "${word}" not found`,
        });
      }

      return res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch vocabulary',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * DELETE /api/vocabulary/:id
   * Delete single vocabulary by ID
   */
  static async deleteById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const success = await vocabularyService.deleteById(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Vocabulary not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Vocabulary deleted',
      });
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete vocabulary',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /api/vocabulary/delete-many
   * Delete multiple vocabulary by IDs
   */
  static async deleteMany(req: Request, res: Response) {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing or invalid ids array',
        });
      }

      const deletedCount = await vocabularyService.deleteMany(ids);

      return res.status(200).json({
        success: true,
        deleted: deletedCount,
        message: `Deleted ${deletedCount} vocabulary items`,
      });
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete vocabulary',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
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
      const { userId, limit, level } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing userId parameter',
        });
      }

      const items = await vocabularyService.getDueCards(
        userId as string,
        limit ? parseInt(limit as string, 10) : 20,
        level as string
      );

      return res.status(200).json({
        success: true,
        data: items,
        count: items.length,
      });
    } catch (error) {
      console.error('Error fetching due cards:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch due cards',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /api/vocabulary/srs/review
   * Submit a review and update SRS parameters
   */
  static async submitReview(req: Request, res: Response) {
    try {
      const { userId, vocabId, rating } = req.body;

      if (!userId || !vocabId || rating === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, vocabId, rating',
        });
      }

      if (rating < 0 || rating > 3) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 0 and 3 (0=Again, 1=Hard, 2=Good, 3=Easy)',
        });
      }

      const progress = await vocabularyService.submitReview(userId, vocabId, rating);

      return res.status(200).json({
        success: true,
        data: progress,
        message: 'Review submitted successfully',
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to submit review',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/vocabulary/srs/progress/:userId
   * Get user's learning progress statistics
   */
  static async getUserProgress(req: Request, res: Response) {
    try {
      const userId = req.params.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing userId parameter',
        });
      }

      const stats = await vocabularyService.getUserProgress(userId);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user progress',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/vocabulary/with-progress
   * Get vocabulary with user progress
   */
  static async listWithProgress(req: Request, res: Response) {
    try {
      const { userId, level, topic, pos, search, limit, offset } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing userId parameter',
        });
      }

      const result = await vocabularyService.getVocabularyWithProgress(
        userId as string,
        {
          level: level as string,
          topic: topic as string,
          pos: pos as string,
          search: search as string,
          limit: limit ? parseInt(limit as string, 10) : 50,
          offset: offset ? parseInt(offset as string, 10) : 0,
        }
      );

      return res.status(200).json({
        success: true,
        data: result.items,
        pagination: {
          total: result.total,
          limit: limit ? parseInt(limit as string, 10) : 50,
          offset: offset ? parseInt(offset as string, 10) : 0,
        },
      });
    } catch (error) {
      console.error('Error listing vocabulary with progress:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch vocabulary with progress',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
