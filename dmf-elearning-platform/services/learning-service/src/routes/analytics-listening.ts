/**
 * Listening Analytics API Routes
 * 
 * Endpoints:
 * - GET /api/analytics/listening/stats - User listening statistics
 * - GET /api/analytics/listening/weekly - Weekly statistics
 * - GET /api/analytics/listening/daily - Daily summary
 * - GET /api/analytics/listening/leaderboard - Leaderboard
 * - GET /api/analytics/listening/recommended - Recommended exercises (adaptive)
 */

import express from 'express';
import { z } from 'zod';
import { 
  getUserListeningStats, 
  getWeeklyStats, 
  getDailySummary,
  getLeaderboard 
} from '../lib/listening-analytics';
import { getRecommendedExercises } from '../lib/difficulty-adjustment';
import {
  attachAuthenticatedUserId,
  authMiddleware,
  ensureAuthenticatedUserProfile,
} from '../middlewares/auth';

const router = express.Router();

const dailyQuerySchema = z.object({
  date: z.string().trim().min(1).optional(),
});

const leaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  timeframe: z.enum(['all-time', 'month', 'week']).optional().default('all-time'),
});

const recommendedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional().default(5),
});

function validationError(res: express.Response, message: string, details?: unknown) {
  return res.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message,
      details,
    },
  });
}

function internalError(res: express.Response, message: string) {
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  });
}

/**
 * GET /api/analytics/listening/stats
 * Get comprehensive listening statistics for a user
 * 
 * Headers:
 * - x-user-id: User ID (required)
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     total_exercises_completed: number,
 *     total_listening_time_seconds: number,
 *     average_accuracy: number,
 *     current_streak: number,
 *     longest_streak: number,
 *     exercises_by_difficulty: [...],
 *     exercises_by_week: [...]
 *   }
 * }
 */
router.get('/stats', authMiddleware, attachAuthenticatedUserId, ensureAuthenticatedUserProfile, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const stats = await getUserListeningStats(userId);
    
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[analytics-routes] GET /stats failed:', error);
    return internalError(res, 'Failed to fetch listening statistics');
  }
});

/**
 * GET /api/analytics/listening/weekly
 * Get weekly statistics for a user
 * 
 * Headers:
 * - x-user-id: User ID (required)
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     weekly_exercises: number,
 *     weekly_time_seconds: number,
 *     weekly_accuracy: number,
 *     weekly_correct_count: number
 *   }
 * }
 */
router.get('/weekly', authMiddleware, attachAuthenticatedUserId, ensureAuthenticatedUserProfile, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const stats = await getWeeklyStats(userId);
    
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[analytics-routes] GET /weekly failed:', error);
    return internalError(res, 'Failed to fetch weekly statistics');
  }
});

/**
 * GET /api/analytics/listening/daily
 * Get daily summary for a user
 * 
 * Headers:
 * - x-user-id: User ID (required)
 * 
 * Query:
 * - date: Date string (YYYY-MM-DD, optional, defaults to today)
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     date: string,
 *     exercises_today: number,
 *     time_today_seconds: number,
 *     correct_today: number,
 *     total_attempts: number
 *   }
 * }
 */
router.get('/daily', authMiddleware, attachAuthenticatedUserId, ensureAuthenticatedUserProfile, async (req, res) => {
  try {
    const userId = req.user!.id;
    const query = dailyQuerySchema.parse(req.query);
    const date = query.date ? new Date(query.date) : new Date();
    
    if (isNaN(date.getTime())) {
      return validationError(res, 'Invalid date format. Use YYYY-MM-DD.');
    }
    
    const summary = await getDailySummary(userId, date);
    
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return validationError(res, 'Invalid daily query payload', error.issues);
    }
    console.error('[analytics-routes] GET /daily failed:', error);
    return internalError(res, 'Failed to fetch daily summary');
  }
});

/**
 * GET /api/analytics/listening/leaderboard
 * Get listening leaderboard
 * 
 * Query:
 * - limit: Number of top users (optional, default: 10, max: 100)
 * - timeframe: 'all-time' | 'month' | 'week' (optional, default: 'all-time')
 * 
 * Response:
 * {
 *   success: true,
 *   data: [
 *     {
 *       rank: number,
 *       user_id: string,
 *       user_name: string,
 *       exercises_completed: number,
 *       avg_accuracy: number,
 *       total_time_seconds: number
 *     },
 *     ...
 *   ]
 * }
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const query = leaderboardQuerySchema.parse(req.query);
    const limit = query.limit;
    const timeframe = query.timeframe;
    
    const leaderboard = await getLeaderboard(limit, timeframe);
    
    return res.status(200).json({
      success: true,
      data: leaderboard,
      count: leaderboard.length,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return validationError(res, 'Invalid leaderboard query payload', error.issues);
    }
    console.error('[analytics-routes] GET /leaderboard failed:', error);
    return internalError(res, 'Failed to fetch leaderboard');
  }
});

/**
 * GET /api/analytics/listening/recommended
 * Get recommended exercises based on adaptive difficulty
 * 
 * Headers:
 * - x-user-id: User ID (required)
 * 
 * Query:
 * - limit: Number of exercises (optional, default: 5, max: 20)
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     recommendedDifficulty: number,
 *     exercises: [...]
 *   }
 * }
 */
router.get(
  '/recommended',
  authMiddleware,
  attachAuthenticatedUserId,
  ensureAuthenticatedUserProfile,
  async (req, res) => {
  try {
    const userId = req.user!.id;
    const query = recommendedQuerySchema.parse(req.query);
    const limit = query.limit;
    
    const recommended = await getRecommendedExercises(userId, limit);
    
    return res.status(200).json({
      success: true,
      data: recommended,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return validationError(res, 'Invalid recommended query payload', error.issues);
    }
    console.error('[analytics-routes] GET /recommended failed:', error);
    return internalError(res, 'Failed to fetch recommended exercises');
  }
});

export default router;
