/**
 * SQLite Idempotency Store adapter (Bộ chuyển đổi Kho Idempotency SQLite)
 * 
 * Implements IdempotencyStore interface using SQLite.
 */

import type { IdempotencyStore, IdempotencyResult } from '../idempotency-store.js';
import type { Database } from '../database.js';

export class SQLiteIdempotencyStore implements IdempotencyStore {
  constructor(private db: Database) {}

  async get(key: string): Promise<IdempotencyResult | null> {
    const results = await this.db.query<{
      key: string;
      result_ids: string;
      emitted_event_ids: string;
      timestamp: string;
    }>('SELECT * FROM idempotency WHERE key = ?', [key]);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return {
      resultIds: JSON.parse(row.result_ids),
      emittedEventIds: JSON.parse(row.emitted_event_ids),
      timestamp: row.timestamp,
    };
  }

  async set(key: string, result: IdempotencyResult): Promise<void> {
    await this.db.query(
      `INSERT OR REPLACE INTO idempotency (key, result_ids, emitted_event_ids, timestamp)
       VALUES (?, ?, ?, ?)`,
      [
        key,
        JSON.stringify(result.resultIds),
        JSON.stringify(result.emittedEventIds),
        result.timestamp,
      ]
    );
  }

  async exists(key: string): Promise<boolean> {
    const results = await this.db.query<{ count: number }>(
      'SELECT COUNT(*) as count FROM idempotency WHERE key = ?',
      [key]
    );
    return results[0].count > 0;
  }
}
