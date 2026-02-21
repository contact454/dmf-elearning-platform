/**
 * In-Memory User Stats Repository
 */

export interface UserStats {
  id: string;
  userId: string;
  xp: number;
  level: number;
  streak: number;
  lastCheckInAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreakCheckInResult {
  stats: UserStats;
  streakIncreased: boolean;
  alreadyCheckedIn: boolean;
}

export interface UserStatsRepository {
  findByUserId(userId: string): Promise<UserStats | null>;
  save(stats: UserStats): Promise<UserStats>;
  addXP(userId: string, amount: number): Promise<UserStats>;
  checkIn(userId: string, at?: Date): Promise<StreakCheckInResult>;
  getLeaderboard(limit: number): Promise<UserStats[]>;
}

class InMemoryUserStatsRepository implements UserStatsRepository {
  private store = new Map<string, UserStats>();

  constructor() {
    // Seed with demo users
    this.seedDemoUsers();
  }

  private seedDemoUsers() {
    const demoUsers = [
      { userId: 'user-m3-demo', xp: 1670, streak: 5 },
      { userId: 'alice-nguyen', xp: 2500, streak: 12 },
      { userId: 'bob-tran', xp: 2200, streak: 8 },
      { userId: 'carol-le', xp: 1900, streak: 6 },
      { userId: 'david-pham', xp: 1800, streak: 15 },
      { userId: 'emma-vo', xp: 1600, streak: 4 },
      { userId: 'frank-do', xp: 1400, streak: 7 },
      { userId: 'grace-hoang', xp: 1200, streak: 3 },
      { userId: 'henry-bui', xp: 1000, streak: 2 },
      { userId: 'iris-duong', xp: 800, streak: 9 },
      { userId: 'jack-ngo', xp: 600, streak: 1 },
    ];

    demoUsers.forEach(({ userId, xp, streak }) => {
      const level = Math.floor(Math.sqrt(xp / 100)) + 1;
      const stats: UserStats = {
        id: `stats-${userId}`,
        userId,
        xp,
        level,
        streak,
        lastCheckInAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.store.set(stats.id, stats);
    });
  }

  async findByUserId(userId: string): Promise<UserStats | null> {
    for (const stats of this.store.values()) {
      if (stats.userId === userId) return stats;
    }
    return null;
  }

  async save(stats: UserStats): Promise<UserStats> {
    const stored = { ...stats, updatedAt: new Date() };
    this.store.set(stored.id, stored);
    return stored;
  }

  async addXP(userId: string, amount: number): Promise<UserStats> {
    let stats = await this.findByUserId(userId);

    if (!stats) {
      // Create new stats
      stats = {
        id: `stats-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        xp: 0,
        level: 1,
        streak: 0,
        lastCheckInAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Add XP
    stats.xp += amount;

    // Calculate new level: Level = floor(sqrt(xp / 100)) + 1
    stats.level = Math.floor(Math.sqrt(stats.xp / 100)) + 1;

    return this.save(stats);
  }

  async checkIn(userId: string, at: Date = new Date()): Promise<StreakCheckInResult> {
    let stats = await this.findByUserId(userId);

    if (!stats) {
      stats = {
        id: `stats-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        xp: 0,
        level: 1,
        streak: 0,
        lastCheckInAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    if (stats.lastCheckInAt && this.isSameUtcDay(stats.lastCheckInAt, at)) {
      return {
        stats,
        streakIncreased: false,
        alreadyCheckedIn: true,
      };
    }

    if (!stats.lastCheckInAt) {
      stats.streak = stats.streak > 0 ? stats.streak + 1 : 1;
    } else {
      const dayDiff = this.dayDiffUtc(stats.lastCheckInAt, at);

      if (dayDiff === 1) {
        stats.streak += 1;
      } else if (dayDiff > 1) {
        stats.streak = 1;
      }
    }

    stats.lastCheckInAt = at;

    const saved = await this.save(stats);
    return {
      stats: saved,
      streakIncreased: true,
      alreadyCheckedIn: false,
    };
  }

  async getLeaderboard(limit: number = 10): Promise<UserStats[]> {
    const allStats = Array.from(this.store.values());
    return allStats
      .sort((a, b) => b.xp - a.xp) // Sort by XP descending
      .slice(0, limit);
  }

  private isSameUtcDay(left: Date, right: Date): boolean {
    return (
      left.getUTCFullYear() === right.getUTCFullYear() &&
      left.getUTCMonth() === right.getUTCMonth() &&
      left.getUTCDate() === right.getUTCDate()
    );
  }

  private dayDiffUtc(start: Date, end: Date): number {
    const startDate = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    const endDate = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
    return Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000));
  }
}

export function createInMemoryUserStatsRepository(): UserStatsRepository {
  return new InMemoryUserStatsRepository();
}
