/**
 * SQLite Outbox adapter (Bộ chuyển đổi Outbox SQLite)
 * 
 * Implements Outbox interface using SQLite.
 */

import type { Outbox, OutboxRecord } from '../outbox.js';
import type { Database } from '../database.js';

export class SQLiteOutbox implements Outbox {
  constructor(private db: Database) {}

  async create(record: OutboxRecord): Promise<OutboxRecord> {
    await this.db.query(
      `INSERT INTO outbox (outbox_id, command_key, event_id, event_name, payload, status, created_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.outboxId,
        record.commandKey || null,
        record.eventId,
        record.eventName,
        JSON.stringify(record.payload),
        record.status,
        record.createdAt,
        record.publishedAt || null,
      ]
    );
    return record;
  }

  async findByEventId(eventId: string): Promise<OutboxRecord | null> {
    const results = await this.db.query<{
      outbox_id: string;
      command_key: string | null;
      event_id: string;
      event_name: string;
      payload: string;
      status: string;
      created_at: string;
      published_at: string | null;
    }>('SELECT * FROM outbox WHERE event_id = ?', [eventId]);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return {
      outboxId: row.outbox_id,
      commandKey: row.command_key || undefined,
      eventId: row.event_id,
      eventName: row.event_name,
      payload: JSON.parse(row.payload),
      status: row.status as 'pending' | 'published',
      createdAt: row.created_at,
      publishedAt: row.published_at || undefined,
    };
  }

  async findPublishedByCommandKey(commandKey: string): Promise<OutboxRecord[]> {
    const results = await this.db.query<{
      outbox_id: string;
      command_key: string | null;
      event_id: string;
      event_name: string;
      payload: string;
      status: string;
      created_at: string;
      published_at: string | null;
    }>('SELECT * FROM outbox WHERE command_key = ? AND status = ?', [commandKey, 'published']);

    return results.map((row) => ({
      outboxId: row.outbox_id,
      commandKey: row.command_key || undefined,
      eventId: row.event_id,
      eventName: row.event_name,
      payload: JSON.parse(row.payload),
      status: row.status as 'pending' | 'published',
      createdAt: row.created_at,
      publishedAt: row.published_at || undefined,
    }));
  }

  async markPublished(outboxId: string): Promise<void> {
    await this.db.query(
      'UPDATE outbox SET status = ?, published_at = ? WHERE outbox_id = ?',
      ['published', new Date().toISOString(), outboxId]
    );
  }

  async getPending(): Promise<OutboxRecord[]> {
    const results = await this.db.query<{
      outbox_id: string;
      command_key: string | null;
      event_id: string;
      event_name: string;
      payload: string;
      status: string;
      created_at: string;
      published_at: string | null;
    }>('SELECT * FROM outbox WHERE status = ? ORDER BY created_at ASC', ['pending']);

    return results.map((row) => ({
      outboxId: row.outbox_id,
      commandKey: row.command_key || undefined,
      eventId: row.event_id,
      eventName: row.event_name,
      payload: JSON.parse(row.payload),
      status: row.status as 'pending' | 'published',
      createdAt: row.created_at,
      publishedAt: row.published_at || undefined,
    }));
  }
}
