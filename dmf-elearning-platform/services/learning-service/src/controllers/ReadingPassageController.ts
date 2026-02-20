import { Request, Response } from 'express';
import { ReadingPassageService } from '../services/ReadingPassageService';

const readingPassageService = new ReadingPassageService();

function asString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
}

export class ReadingPassageController {
  // ═══════════════════════════════════════════════════════════════
  // 1. GET /api/reading/passages
  // Fetch passages with filters
  // ═══════════════════════════════════════════════════════════════
  
  static async getPassages(req: Request, res: Response) {
    try {
      const { level, topic, search, limit, offset } = req.query;

      const result = await readingPassageService.getPassages({
        level: level as string,
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
      console.error('Error fetching passages:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch passages',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 2. GET /api/reading/passages/:id
  // Get single passage with exercises
  // ═══════════════════════════════════════════════════════════════
  
  static async getPassageById(req: Request, res: Response) {
    try {
      const id = asString(req.params.id);
      const userId = asString(req.query.userId);

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing passage id',
          code: 'MISSING_PASSAGE_ID',
        });
      }

      const passage = await readingPassageService.getPassageById(
        id,
        userId
      );

      if (!passage) {
        return res.status(404).json({
          success: false,
          error: 'Passage not found',
          code: 'PASSAGE_NOT_FOUND',
        });
      }

      return res.status(200).json({
        success: true,
        data: passage,
      });
    } catch (error) {
      console.error('Error fetching passage:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch passage',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 3. POST /api/reading/submit
  // Submit exercise answer with validation
  // ═══════════════════════════════════════════════════════════════
  
  static async submitAnswer(req: Request, res: Response) {
    try {
      const { userId, passageId, exerciseId, userAnswer, timeSpentSeconds } = req.body;

      // Validate required fields
      if (!userId || !passageId || !exerciseId || userAnswer === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'userId, passageId, exerciseId, and userAnswer are required',
          code: 'MISSING_FIELDS',
        });
      }

      const result = await readingPassageService.submitAnswer({
        userId,
        passageId,
        exerciseId,
        userAnswer,
        timeSpentSeconds: timeSpentSeconds || 0,
      });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      
      // Handle specific errors
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Exercise not found',
          message: error.message,
          code: 'EXERCISE_NOT_FOUND',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Failed to submit answer',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 4. GET /api/reading/progress
  // Get user reading progress
  // ═══════════════════════════════════════════════════════════════
  
  static async getProgress(req: Request, res: Response) {
    try {
      const { userId, passageId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter',
          message: 'userId is required',
          code: 'MISSING_USER_ID',
        });
      }

      const progress = await readingPassageService.getUserProgress(
        userId as string,
        passageId as string | undefined
      );

      return res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch progress',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 5. POST /api/reading/vocabulary/save
  // Save vocabulary word for SRS
  // ═══════════════════════════════════════════════════════════════
  
  static async saveVocabulary(req: Request, res: Response) {
    try {
      const { passageId, word, translation, context, sentence } = req.body;
      const userId = req.user?.id;

      // Validate required fields
      if (!userId || !passageId || !word || !translation) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'userId, passageId, word, and translation are required',
          code: 'MISSING_FIELDS',
        });
      }

      const result = await readingPassageService.saveVocabulary({
        userId,
        passageId,
        word,
        translation,
        context,
        sentence,
      });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error saving vocabulary:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to save vocabulary',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
