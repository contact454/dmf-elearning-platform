/**
 * In-memory Outbox adapter (Bộ chuyển đổi Outbox trong bộ nhớ)
 * 
 * Simple in-memory implementation for MVP.
 * Ensures write-then-emit safety (an toàn phát sự kiện).
 */

import type { Outbox, OutboxRecord } from '../outbox.js';

export class InMemoryOutbox implements Outbox {
  private records: Map<string, OutboxRecord> = new Map();

  /**
   * Create outbox record (Tạo bản ghi outbox)
   */
  async create(record: OutboxRecord): Promise<OutboxRecord> {
    this.records.set(record.outboxId, record);
    return record;
  }

  /**
   * Find outbox record by eventId (Tìm bản ghi outbox theo eventId)
   */
  async findByEventId(eventId: string): Promise<OutboxRecord | null> {
    for (const record of this.records.values()) {
      if (record.eventId === eventId) {
        return record;
      }
    }
    return null;
  }

  /**
   * Find published records by commandKey (Tìm bản ghi đã phát hành theo commandKey)
   */
  async findPublishedByCommandKey(commandKey: string): Promise<OutboxRecord[]> {
    const records: OutboxRecord[] = [];
    for (const record of this.records.values()) {
      if (record.commandKey === commandKey && record.status === 'published') {
        records.push(record);
      }
    }
    return records;
  }

  /**
   * Mark outbox record as published (Đánh dấu bản ghi outbox đã phát hành)
   */
  async markPublished(outboxId: string): Promise<void> {
    const record = this.records.get(outboxId);
    if (record) {
      record.status = 'published';
      record.publishedAt = new Date().toISOString();
      this.records.set(outboxId, record);
    }
  }

  /**
   * Get pending records (Lấy bản ghi đang chờ)
   */
  async getPending(): Promise<OutboxRecord[]> {
    const records: OutboxRecord[] = [];
    for (const record of this.records.values()) {
      if (record.status === 'pending') {
        records.push(record);
      }
    }
    return records;
  }

  /**
   * Clear all records (for testing) (Xóa tất cả bản ghi - cho kiểm tra)
   */
  clear(): void {
    this.records.clear();
  }
}
