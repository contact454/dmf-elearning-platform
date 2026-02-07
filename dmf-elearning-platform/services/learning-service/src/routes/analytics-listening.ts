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
import { 
  getUserListeningStats, 
  getWeeklyStats, 
  getDailySummary,
  getLeaderboard 
} from '../lib/listening-analytics';
import { getRecommendedExercises } from '../lib/difficulty-adjustment';

const router = express.Router();

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
router.get('/stats', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: x-user-id header required',
      });
    }
    
    const stats = await getUserListeningStats(userId);
    
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[analytics-routes] GET /stats failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch listening statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
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
router.get('/weekly', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: x-user-id header required',
      });
    }
    
    const stats = await getWeeklyStats(userId);
    
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[analytics-routes] GET /weekly failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch weekly statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
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
router.get('/daily', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const dateParam = req.query.date as string | undefined;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: x-user-id header required',
      });
    }
    
    const date = dateParam ? new Date(dateParam) : new Date();
    
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD.',
      });
    }
    
    const summary = await getDailySummary(userId, date);
    
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('[analytics-routes] GET /daily failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch daily summary',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
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
    const limitParam = req.query.limit as string | undefined;
    const timeframe = (req.query.timeframe as 'all-time' | 'month' | 'week') || 'all-time';
    
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 10;
    
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid limit parameter. Must be 1-100.',
      });
    }
    
    if (!['all-time', 'month', 'week'].includes(timeframe)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid timeframe. Must be: all-time, month, or week.',
      });
    }
    
    const leaderboard = await getLeaderboard(limit, timeframe);
    
    return res.status(200).json({
      success: true,
      data: leaderboard,
      count: leaderboard.length,
    });
  } catch (error) {
    console.error('[analytics-routes] GET /leaderboard failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
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
router.get('/recommended', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const limitParam = req.query.limit as string | undefined;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: x-user-id header required',
      });
    }
    
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 20) : 5;
    
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid limit parameter. Must be 1-20.',
      });
    }
    
    const recommended = await getRecommendedExercises(userId, limit);
    
    return res.status(200).json({
      success: true,
      data: recommended,
    });
  } catch (error) {
    console.error('[analytics-routes] GET /recommended failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch recommended exercises',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
