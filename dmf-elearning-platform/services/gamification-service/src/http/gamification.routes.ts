/**
 * Gamification API Routes
 * GET /api/gamification/stats/:userId - Get user stats
 * POST /api/gamification/add-xp - Add XP to user
 */

import type { FastifyInstance } from 'fastify';
import type { UserStatsRepository } from '../state/in-memory-stats.repository.js';

interface StatsParams {
  userId: string;
}

interface AddXPBody {
  userId: string;
  amount: number;
}

interface StreakParams {
  userId: string;
}

interface StreakCheckInBody {
  userId: string;
}

export function registerGamificationRoutes(
  app: FastifyInstance,
  deps: {
    statsRepo: UserStatsRepository;
  }
): void {
  // GET /api/gamification/stats/:userId
  app.get<{ Params: StatsParams }>('/api/gamification/stats/:userId', async (request, reply) => {
    const { userId } = request.params;

    try {
      const stats = await deps.statsRepo.findByUserId(userId);

      if (!stats) {
        return reply.code(404).send({
          error: {
            code: 'NOT_FOUND',
            message: 'User stats not found',
          },
        });
      }

      // Calculate XP needed for next level
      const nextLevelMinXP = Math.pow(stats.level, 2) * 100;
      const xpForNextLevel = nextLevelMinXP - stats.xp;

      return reply.code(200).send({
        userId: stats.userId,
        currentXP: stats.xp,
        currentLevel: stats.level,
        nextLevelXP: nextLevelMinXP,
        xpForNextLevel: xpForNextLevel > 0 ? xpForNextLevel : 0,
        streak: stats.streak,
        lastUpdated: stats.updatedAt,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user stats',
        },
      });
    }
  });

  // POST /api/gamification/add-xp
  app.post<{ Body: AddXPBody }>('/api/gamification/add-xp', async (request, reply) => {
    const { userId, amount } = request.body;

    if (!userId || amount === undefined) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'userId and amount are required',
        },
      });
    }

    if (amount < 0) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'amount must be positive',
        },
      });
    }

    try {
      const oldStats = await deps.statsRepo.findByUserId(userId);
      const oldLevel = oldStats?.level ?? 1;

      const newStats = await deps.statsRepo.addXP(userId, amount);

      const leveledUp = newStats.level > oldLevel;

      return reply.code(200).send({
        userId: newStats.userId,
        xp: newStats.xp,
        level: newStats.level,
        leveledUp,
        message: leveledUp ? `🎉 Level Up! You are now level ${newStats.level}!` : 'XP added successfully',
      });
    } catch (error) {
      console.error('Error adding XP:', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to add XP',
        },
      });
    }
  });

  // GET /api/gamification/streak/:userId
  app.get<{ Params: StreakParams }>('/api/gamification/streak/:userId', async (request, reply) => {
    const { userId } = request.params;

    try {
      const stats = await deps.statsRepo.findByUserId(userId);

      if (!stats) {
        return reply.code(404).send({
          error: {
            code: 'NOT_FOUND',
            message: 'User stats not found',
          },
        });
      }

      const now = new Date();
      const canCheckIn =
        !stats.lastCheckInAt ||
        !isSameUtcDay(stats.lastCheckInAt, now);

      return reply.code(200).send({
        userId: stats.userId,
        streak: stats.streak,
        lastCheckInAt: stats.lastCheckInAt,
        canCheckIn,
        lastUpdated: stats.updatedAt,
      });
    } catch (error) {
      console.error('Error fetching streak:', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch streak',
        },
      });
    }
  });

  // POST /api/gamification/streak/check-in
  app.post<{ Body: StreakCheckInBody }>(
    '/api/gamification/streak/check-in',
    async (request, reply) => {
      const { userId } = request.body;

      if (!userId) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'userId is required',
          },
        });
      }

      try {
        const result = await deps.statsRepo.checkIn(userId);

        return reply.code(200).send({
          userId: result.stats.userId,
          streak: result.stats.streak,
          lastCheckInAt: result.stats.lastCheckInAt,
          streakIncreased: result.streakIncreased,
          alreadyCheckedIn: result.alreadyCheckedIn,
          message: result.alreadyCheckedIn
            ? 'Already checked in today'
            : 'Streak updated successfully',
        });
      } catch (error) {
        console.error('Error updating streak:', error);
        return reply.code(500).send({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update streak',
          },
        });
      }
    }
  );

  // Debug: Seed stats
  app.post<{ Body: { userId: string; xp: number; streak: number } }>(
    '/api/debug/seed-stats',
    async (request, reply) => {
      const { userId, xp, streak } = request.body;

      const stats = {
        id: `stats-${Date.now()}`,
        userId,
        xp,
        level: Math.floor(Math.sqrt(xp / 100)) + 1,
        streak: streak || 0,
        lastCheckInAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await deps.statsRepo.save(stats);

      return reply.send({
        message: 'Stats seeded successfully',
        stats,
      });
    }
  );

  // GET /api/gamification/leaderboard
  app.get<{ Querystring: { limit?: string } }>(
    '/api/gamification/leaderboard',
    async (request, reply) => {
      const limit = parseInt((request.query as { limit?: string }).limit || '10', 10);

      try {
        const topUsers = await deps.statsRepo.getLeaderboard(limit);

        // Map to readable usernames and add rank
        const leaderboard = topUsers.map((stats, index) => ({
          rank: index + 1,
          userId: stats.userId,
          username: getUserDisplayName(stats.userId),
          xp: stats.xp,
          level: stats.level,
          streak: stats.streak,
        }));

        return reply.code(200).send({ leaderboard });
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return reply.code(500).send({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch leaderboard',
          },
        });
      }
    }
  );
}

function isSameUtcDay(left: Date, right: Date): boolean {
  return (
    left.getUTCFullYear() === right.getUTCFullYear() &&
    left.getUTCMonth() === right.getUTCMonth() &&
    left.getUTCDate() === right.getUTCDate()
  );
}

// Helper: Convert userId to display name
function getUserDisplayName(userId: string): string {
  const nameMap: Record<string, string> = {
    'user-m3-demo': 'You (Demo User)',
    'alice-nguyen': 'Alice Nguyen',
    'bob-tran': 'Bob Tran',
    'carol-le': 'Carol Le',
    'david-pham': 'David Pham',
    'emma-vo': 'Emma Vo',
    'frank-do': 'Frank Do',
    'grace-hoang': 'Grace Hoang',
    'henry-bui': 'Henry Bui',
    'iris-duong': 'Iris Duong',
    'jack-ngo': 'Jack Ngo',
  };
  return nameMap[userId] || userId;
}
