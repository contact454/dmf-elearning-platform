import { Request, Response } from 'express';
import { ListeningService } from '../services/ListeningService';
import { updateProgress as updateSRSProgress } from '../lib/listening-srs';
import { updateStreak } from '../services/streakService';

const listeningService = new ListeningService();

export class ListeningController {
  // ═══════════════════════════════════════════════════════════════
  // Content Endpoints
  // ═══════════════════════════════════════════════════════════════

  /**
   * GET /api/listening
   * List listening content
   */
  static async list(req: Request, res: Response) {
    try {
      const { level, topic, search, limit, offset } = req.query;

      const result = await listeningService.getContent({
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
      console.error('Error listing listening content:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch listening content',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/listening/featured
   */
  static async featured(req: Request, res: Response) {
    try {
      const { limit } = req.query;
      const items = await listeningService.getFeatured(
        limit ? parseInt(limit as string, 10) : 5
      );

      return res.status(200).json({
        success: true,
        data: items,
        count: items.length,
      });
    } catch (error) {
      console.error('Error fetching featured content:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch featured content',
      });
    }
  }

  /**
   * GET /api/listening/stats
   */
  static async stats(req: Request, res: Response) {
    try {
      const stats = await listeningService.getStats();
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
   * GET /api/listening/levels
   */
  static async levels(req: Request, res: Response) {
    try {
      const levels = await listeningService.getLevels();
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
   * GET /api/listening/:id
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      let content;
      if (userId) {
        content = await listeningService.getWithProgress(id, userId as string);
      } else {
        content = await listeningService.getById(id);
      }

      if (!content) {
        return res.status(404).json({
          success: false,
          error: 'Content not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: content,
      });
    } catch (error) {
      console.error('Error fetching content:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch content',
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Exercise Endpoints
  // ═══════════════════════════════════════════════════════════════

  /**
   * GET /api/listening/:id/exercises
   */
  static async getExercises(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const exercises = await listeningService.getExercises(id);

      return res.status(200).json({
        success: true,
        data: exercises,
        count: exercises.length,
      });
    } catch (error) {
      console.error('Error fetching exercises:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch exercises',
      });
    }
  }

  /**
   * GET /api/listening/exercise/:exerciseId
   */
  static async getExercise(req: Request, res: Response) {
    try {
      const { exerciseId } = req.params;
      const exercise = await listeningService.getExerciseById(exerciseId);

      if (!exercise) {
        return res.status(404).json({
          success: false,
          error: 'Exercise not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: exercise,
      });
    } catch (error) {
      console.error('Error fetching exercise:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch exercise',
      });
    }
  }

  /**
   * POST /api/listening/exercise/:exerciseId/attempt
   */
  static async submitAttempt(req: Request, res: Response) {
    try {
      const { exerciseId } = req.params;
      const { userId, userText, accuracy, wordsCorrect, wordsTotal, mistakes, listenCount, timeSpent } = req.body;

      if (!userId || !userText) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, userText',
        });
      }

      // Submit attempt to database
      const attempt = await listeningService.submitAttempt(exerciseId, userId, {
        userText,
        accuracy: accuracy || 0,
        wordsCorrect: wordsCorrect || 0,
        wordsTotal: wordsTotal || 0,
        mistakes: mistakes || [],
        listenCount: listenCount || 1,
        timeSpent: timeSpent || 0,
      });

      // Update SRS progress
      const srsResult = await updateSRSProgress(userId, exerciseId, {
        correct: (accuracy || 0) >= 70, // 70%+ considered correct
        accuracy_score: accuracy || 0,
        time_spent_seconds: timeSpent || 0,
      });

      // Update streak if correct
      if ((accuracy || 0) >= 70) {
        await updateStreak(userId);
      }

      return res.status(201).json({
        success: true,
        data: {
          attempt,
          srs: {
            quality: srsResult.quality,
            nextReviewAt: srsResult.nextReviewAt,
            interval: srsResult.interval,
            easeFactor: srsResult.easeFactor,
            xpEarned: srsResult.xp_earned,
          },
        },
      });
    } catch (error) {
      console.error('Error submitting attempt:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to submit attempt',
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Progress Endpoints
  // ═══════════════════════════════════════════════════════════════

  /**
   * POST /api/listening/:id/start
   */
  static async startListening(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing userId',
        });
      }

      const progress = await listeningService.startListening(userId, id);
      return res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      console.error('Error starting listening:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to start listening',
      });
    }
  }

  /**
   * PUT /api/listening/:id/progress
   */
  static async updateProgress(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId, totalListenTime, lastPosition, playCount } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing userId',
        });
      }

      const progress = await listeningService.updateProgress(userId, id, {
        totalListenTime,
        lastPosition,
        playCount,
      });

      return res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update progress',
      });
    }
  }

  /**
   * GET /api/listening/user/:userId/history
   */
  static async getUserHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { status } = req.query;

      const history = await listeningService.getUserHistory(userId, status as string);

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
   * GET /api/listening/user/:userId/stats
   */
  static async getUserStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const stats = await listeningService.getUserStats(userId);

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
   * POST /api/listening
   */
  static async createContent(req: Request, res: Response) {
    try {
      const { title, description, level, topic, audioUrl, duration, transcript, transcriptVi, segments, source, speaker } = req.body;

      if (!title || !level || !transcript) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title, level, transcript',
        });
      }

      const content = await listeningService.createContent({
        title,
        description,
        level,
        topic,
        audioUrl,
        duration,
        transcript,
        transcriptVi,
        segments,
        source,
        speaker,
      });

      return res.status(201).json({
        success: true,
        data: content,
      });
    } catch (error) {
      console.error('Error creating content:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create content',
      });
    }
  }

  /**
   * POST /api/listening/:id/exercises/generate
   */
  static async generateExercises(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const exercises = await listeningService.generateExercisesFromSegments(id);

      return res.status(201).json({
        success: true,
        data: exercises,
        count: exercises.length,
      });
    } catch (error) {
      console.error('Error generating exercises:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate exercises',
      });
    }
  }

  /**
   * POST /api/listening/seed
   * Seed sample listening content
   */
  static async seedContent(req: Request, res: Response) {
    try {
      const count = await listeningService.seedContent();

      return res.status(201).json({
        success: true,
        data: { count },
        message: `Seeded ${count} listening content items`,
      });
    } catch (error) {
      console.error('Error seeding content:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to seed content',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
