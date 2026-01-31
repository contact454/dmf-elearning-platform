/**
 * In-Memory User Stats Repository
 */

export interface UserStats {
  id: string;
  userId: string;
  xp: number;
  level: number;
  streak: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStatsRepository {
  findByUserId(userId: string): Promise<UserStats | null>;
  save(stats: UserStats): Promise<UserStats>;
  addXP(userId: string, amount: number): Promise<UserStats>;
}

class InMemoryUserStatsRepository implements UserStatsRepository {
  private store = new Map<string, UserStats>();

  async findByUserId(userId: string): Promise<UserStats | null> {
    for (const stats of this.store.values()) {
      if (stats.userId === userId) return stats;
    }
    return null;
  }

  async save(stats: UserStats): Promise<UserStats> {
    this.store.set(stats.id, { ...stats, updatedAt: new Date() });
    return stats;
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
}

export function createInMemoryUserStatsRepository(): UserStatsRepository {
  return new InMemoryUserStatsRepository();
}
