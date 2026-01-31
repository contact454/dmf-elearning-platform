/**
 * Readiness Cache Repository (Kho lưu trữ Cache Sẵn sàng)
 * 
 * Optional cache for ReadinessState. Cache is NOT source of truth.
 * Cache is invalidated on events, recomputed on read.
 */

import type { UserId } from '@dmf/shared';
import type { Database } from '@dmf/infra';
import type { ReadinessState } from '@dmf/education-readiness-model';

export class ReadinessCacheRepository {
  constructor(private db: Database) {}

  async get(userId: UserId): Promise<ReadinessState | null> {
    const results = await this.db.query<ReadinessState>(
      'SELECT * FROM readiness_cache WHERE userId = ?',
      [userId]
    );
    return results[0] || null;
  }

  async set(readinessState: ReadinessState): Promise<void> {
    const existing = await this.get(readinessState.userId);
    if (existing) {
      await this.db.query('UPDATE readiness_cache SET ? WHERE userId = ?', [
        readinessState,
        readinessState.userId,
      ]);
    } else {
      await this.db.query('INSERT INTO readiness_cache VALUES ?', [readinessState]);
    }
  }

  async invalidate(userId: UserId): Promise<void> {
    await this.db.query('DELETE FROM readiness_cache WHERE userId = ?', [userId]);
  }
}
