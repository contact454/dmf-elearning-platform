/**
 * Listening Analytics Functions
 * 
 * Aggregate and analyze user listening performance data
 * Provides statistics for dashboards and progress tracking
 */

import { PrismaClient } from '@prisma/client';
import { getStreakData } from '../services/streakService';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

export interface UserListeningStats {
  total_exercises_completed: number;
  total_listening_time_seconds: number;
  average_accuracy: number;
  current_streak: number;
  longest_streak: number;
  exercises_by_difficulty: Array<{
    difficulty: number;
    count: number;
  }>;
  exercises_by_week: Array<{
    week: string;
    count: number;
    avg_accuracy: number;
  }>;
}

export interface WeeklyStats {
  weekly_exercises: number;
  weekly_time_seconds: number;
  weekly_accuracy: number;
  weekly_correct_count: number;
}

/**
 * Get comprehensive listening statistics for a user
 * 
 * Returns:
 * - Total exercises completed (distinct exercises with correct answer)
 * - Total listening time (sum of all attempts)
 * - Average accuracy (mean across all attempts)
 * - Current/longest streak
 * - Breakdown by difficulty level
 * - Weekly trend data
 * 
 * @param userId - User ID
 * @returns User listening statistics
 */
export async function getUserListeningStats(userId: string): Promise<UserListeningStats> {
  try {
    // Total exercises completed (distinct exercises where user got correct)
    const completedExercises = await prisma.dictationAttempt.groupBy({
      by: ['exerciseId'],
      where: {
        userId: userId,
        accuracy: {
          gte: 70, // 70%+ considered "completed"
        },
      },
      _count: {
        exerciseId: true,
      },
    });
    
    const total_exercises_completed = completedExercises.length;
    
    // Total listening time and average accuracy
    const timeAndAccuracy = await prisma.dictationAttempt.aggregate({
      where: { userId: userId },
      _sum: {
        timeSpent: true,
      },
      _avg: {
        accuracy: true,
      },
      _count: {
        id: true,
      },
    });
    
    const total_listening_time_seconds = timeAndAccuracy._sum.timeSpent || 0;
    const average_accuracy = timeAndAccuracy._avg.accuracy || 0;
    
    // Streak data
    const streakData = await getStreakData(userId);
    const current_streak = streakData.data?.currentStreak || 0;
    const longest_streak = streakData.data?.longestStreak || 0;
    
    // Exercises by difficulty
    const byDifficulty = await prisma.$queryRaw<Array<{
      difficulty: number;
      count: bigint;
    }>>`
      SELECT 
        e.difficulty,
        COUNT(DISTINCT da."exerciseId")::bigint as count
      FROM "DictationAttempt" da
      JOIN "DictationExercise" e ON da."exerciseId" = e.id
      WHERE da."userId" = ${userId} 
        AND da.accuracy >= 70
      GROUP BY e.difficulty
      ORDER BY e.difficulty
    `;
    
    const exercises_by_difficulty = byDifficulty.map(row => ({
      difficulty: row.difficulty,
      count: Number(row.count),
    }));
    
    // Weekly trend (last 8 weeks)
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
    
    const weeklyTrend = await prisma.$queryRaw<Array<{
      week: string;
      count: bigint;
      avg_accuracy: number;
    }>>`
      SELECT 
        TO_CHAR(DATE_TRUNC('week', "createdAt"), 'YYYY-"W"IW') as week,
        COUNT(DISTINCT "exerciseId")::bigint as count,
        AVG(accuracy)::float as avg_accuracy
      FROM "DictationAttempt"
      WHERE "userId" = ${userId}
        AND "createdAt" >= ${eightWeeksAgo}
      GROUP BY DATE_TRUNC('week', "createdAt")
      ORDER BY DATE_TRUNC('week', "createdAt") DESC
      LIMIT 8
    `;
    
    const exercises_by_week = weeklyTrend.map(row => ({
      week: row.week,
      count: Number(row.count),
      avg_accuracy: Math.round(row.avg_accuracy * 10) / 10,
    }));
    
    return {
      total_exercises_completed,
      total_listening_time_seconds,
      average_accuracy: Math.round(average_accuracy * 10) / 10,
      current_streak,
      longest_streak,
      exercises_by_difficulty,
      exercises_by_week,
    };
  } catch (error) {
    console.error('[listening-analytics] getUserListeningStats failed:', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error('Failed to fetch listening statistics');
  }
}

/**
 * Get listening statistics for the past week
 * 
 * @param userId - User ID
 * @returns Weekly statistics
 */
export async function getWeeklyStats(userId: string): Promise<WeeklyStats> {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyAttempts = await prisma.dictationAttempt.findMany({
      where: {
        userId: userId,
        createdAt: { gte: oneWeekAgo },
      },
      select: {
        exerciseId: true,
        timeSpent: true,
        accuracy: true,
      },
    });
    
    if (weeklyAttempts.length === 0) {
      return {
        weekly_exercises: 0,
        weekly_time_seconds: 0,
        weekly_accuracy: 0,
        weekly_correct_count: 0,
      };
    }
    
    // Unique exercises attempted
    const weekly_exercises = new Set(weeklyAttempts.map(a => a.exerciseId)).size;
    
    // Total time spent
    const weekly_time_seconds = weeklyAttempts.reduce(
      (sum, a) => sum + (a.timeSpent || 0), 
      0
    );
    
    // Average accuracy
    const totalAccuracy = weeklyAttempts.reduce(
      (sum, a) => sum + (a.accuracy || 0), 
      0
    );
    const weekly_accuracy = Math.round((totalAccuracy / weeklyAttempts.length) * 10) / 10;
    
    // Correct attempts (70%+ accuracy)
    const weekly_correct_count = weeklyAttempts.filter(a => (a.accuracy || 0) >= 70).length;
    
    return {
      weekly_exercises,
      weekly_time_seconds,
      weekly_accuracy,
      weekly_correct_count,
    };
  } catch (error) {
    console.error('[listening-analytics] getWeeklyStats failed:', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error('Failed to fetch weekly statistics');
  }
}

/**
 * Get daily practice summary for a specific date
 * 
 * @param userId - User ID
 * @param date - Date to query (defaults to today)
 * @returns Daily summary statistics
 */
export async function getDailySummary(userId: string, date: Date = new Date()) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const dailyAttempts = await prisma.dictationAttempt.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        exerciseId: true,
        accuracy: true,
        timeSpent: true,
      },
    });
    
    const exercises_today = new Set(dailyAttempts.map(a => a.exerciseId)).size;
    const time_today_seconds = dailyAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
    const correct_today = dailyAttempts.filter(a => (a.accuracy || 0) >= 70).length;
    
    return {
      date: date.toISOString().split('T')[0],
      exercises_today,
      time_today_seconds,
      correct_today,
      total_attempts: dailyAttempts.length,
    };
  } catch (error) {
    console.error('[listening-analytics] getDailySummary failed:', {
      userId,
      date,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error('Failed to fetch daily summary');
  }
}

/**
 * Get leaderboard for listening exercises
 * 
 * Ranks users by:
 * 1. Total exercises completed
 * 2. Average accuracy (tiebreaker)
 * 
 * @param limit - Number of top users to return
 * @param timeframe - 'all-time' | 'month' | 'week'
 * @returns Leaderboard data
 */
export async function getLeaderboard(
  limit: number = 10,
  timeframe: 'all-time' | 'month' | 'week' = 'all-time'
) {
  try {
    let dateFilter: Date | undefined;
    
    if (timeframe === 'week') {
      dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - 7);
    } else if (timeframe === 'month') {
      dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - 30);
    }
    
    const leaderboard = await prisma.$queryRaw<Array<{
      user_id: string;
      user_name: string | null;
      exercises_completed: bigint;
      avg_accuracy: number;
      total_time_seconds: bigint;
    }>>`
      SELECT 
        da."userId" as user_id,
        u.name as user_name,
        COUNT(DISTINCT da."exerciseId")::bigint as exercises_completed,
        AVG(da.accuracy)::float as avg_accuracy,
        SUM(da."timeSpent")::bigint as total_time_seconds
      FROM "DictationAttempt" da
      JOIN "User" u ON da."userId" = u.id
      WHERE da.accuracy >= 70
        ${dateFilter ? prisma.$queryRawUnsafe`AND da."createdAt" >= ${dateFilter}` : prisma.$queryRawUnsafe``}
      GROUP BY da."userId", u.name
      ORDER BY exercises_completed DESC, avg_accuracy DESC
      LIMIT ${limit}
    `;
    
    return leaderboard.map((row, index) => ({
      rank: index + 1,
      user_id: row.user_id,
      user_name: row.user_name || 'Anonymous',
      exercises_completed: Number(row.exercises_completed),
      avg_accuracy: Math.round(row.avg_accuracy * 10) / 10,
      total_time_seconds: Number(row.total_time_seconds),
    }));
  } catch (error) {
    console.error('[listening-analytics] getLeaderboard failed:', {
      limit,
      timeframe,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error('Failed to fetch leaderboard');
  }
}
