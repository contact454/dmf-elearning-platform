/**
 * In-memory Database adapter (Bộ chuyển đổi Cơ sở dữ liệu trong bộ nhớ)
 * 
 * Simple in-memory key-value store for MVP.
 * Services use this for state persistence.
 * 
 * Uses module-level shared storage so all InMemoryDatabase instances share the same data.
 * This ensures persistence across requests in the same process.
 */

import type { Database, DatabaseConnectionOptions } from '../database.js';

/**
 * Outbox record (Bản ghi Outbox)
 * 
 * Represents a pending or published event in the outbox.
 */
export interface OutboxRecord {
  outboxId: string;
  commandKey?: string; // correlationId or natural key
  eventId: string;
  eventName: string;
  payload: unknown;
  status: 'pending' | 'published';
  createdAt: string; // ISO 8601
  publishedAt?: string; // ISO 8601
}

// Module-level shared storage for all InMemoryDatabase instances
// This ensures data persists across requests in the same process
const sharedStore = new Map<string, Map<string, unknown>>();
const sharedOutbox = new Map<string, OutboxRecord>();

export class InMemoryDatabase implements Database {
  private connected = false;

  /**
   * Connect to database (Kết nối cơ sở dữ liệu)
   */
  async connect(_options: DatabaseConnectionOptions): Promise<void> {
    this.connected = true;
  }

  /**
   * Disconnect from database (Ngắt kết nối cơ sở dữ liệu)
   */
  async disconnect(): Promise<void> {
    this.connected = false;
  }

  /**
   * Execute query (Thực thi truy vấn)
   * 
   * Simple key-value operations for MVP.
   * Format: "SELECT * FROM table WHERE id = ?" or "INSERT INTO table VALUES ?"
   */
  async query<T = unknown>(query: string, params?: unknown[]): Promise<T[]> {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    // Simple query parsing for MVP (Phân tích truy vấn đơn giản cho MVP)
    if (query.includes('SELECT')) {
      return this.handleSelect<T>(query, params);
    } else if (query.includes('INSERT')) {
      return this.handleInsert<T>(query, params);
    } else if (query.includes('UPDATE')) {
      return this.handleUpdate<T>(query, params);
    } else if (query.includes('DELETE')) {
      return this.handleDelete<T>(query, params);
    }

    return [];
  }

  /**
   * Execute transaction (Thực thi giao dịch)
   */
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    // Simple transaction simulation (Mô phỏng giao dịch đơn giản)
    return callback();
  }

  /**
   * Handle SELECT query (Xử lý truy vấn SELECT)
   */
  private handleSelect<T>(query: string, params?: unknown[]): T[] {
    const tableMatch = query.match(/FROM\s+(\w+)/i);
    if (!tableMatch) return [];

    const tableName = tableMatch[1];
    const table = sharedStore.get(tableName) || new Map();

    // [DB] Debug log
    console.log(`[DB] SELECT from ${tableName}: table size=${table.size}`);

    if (query.includes('WHERE id = ?') && params && params[0]) {
      const id = params[0] as string;
      const record = table.get(id);
      return record ? [record as T] : [];
    }

    // Return all records (Trả về tất cả bản ghi)
    return Array.from(table.values()) as T[];
  }

  /**
   * Handle INSERT query (Xử lý truy vấn INSERT)
   */
  private handleInsert<T>(query: string, params?: unknown[]): T[] {
    const tableMatch = query.match(/INTO\s+(\w+)/i);
    if (!tableMatch || !params || params.length === 0) return [];

    const tableName = tableMatch[1];
    if (!sharedStore.has(tableName)) {
      sharedStore.set(tableName, new Map());
    }

    const table = sharedStore.get(tableName)!;
    const record = params[0] as { id: string };
    table.set(record.id, record);

    // [DB] Debug log
    console.log(`[DB] INSERT into ${tableName}: table size after insert=${table.size}`);

    return [record as T];
  }

  /**
   * Handle UPDATE query (Xử lý truy vấn UPDATE)
   * Format: "UPDATE table SET ? WHERE id = ?" with params [updates, id]
   */
  private handleUpdate<T>(query: string, params?: unknown[]): T[] {
    const tableMatch = query.match(/UPDATE\s+(\w+)/i);
    if (!tableMatch || !params || params.length < 2) return [];

    const tableName = tableMatch[1];
    const table = sharedStore.get(tableName);
    if (!table) return [];

    // UPDATE attempts SET ? WHERE id = ? with [updated, id]
    // So params[0] = updated object, params[1] = id
    const updates = params[0] as Partial<T>;
    const id = params[1] as string;
    const existing = table.get(id) as T;
    if (!existing) return [];

    const updated = { ...existing, ...updates };
    table.set(id, updated);

    return [updated];
  }

  /**
   * Handle DELETE query (Xử lý truy vấn DELETE)
   */
  private handleDelete<T>(query: string, params?: unknown[]): T[] {
    const tableMatch = query.match(/FROM\s+(\w+)/i);
    if (!tableMatch || !params || params.length === 0) return [];

    const tableName = tableMatch[1];
    const table = sharedStore.get(tableName);
    if (!table) return [];

    const id = params[0] as string;
    const record = table.get(id);
    if (record) {
      table.delete(id);
      return [record as T];
    }

    return [];
  }

  /**
   * Get table (for testing) (Lấy bảng - cho kiểm tra)
   */
  getTable(tableName: string): Map<string, unknown> | undefined {
    return sharedStore.get(tableName);
  }

  /**
   * Clear all data (for testing) (Xóa tất cả dữ liệu - cho kiểm tra)
   */
  clear(): void {
    sharedStore.clear();
    sharedOutbox.clear();
  }

  /**
   * Create outbox record (Tạo bản ghi outbox)
   * 
   * Stores event in outbox as pending before publishing.
   */
  async createOutboxRecord(record: OutboxRecord): Promise<OutboxRecord> {
    sharedOutbox.set(record.outboxId, record);
    return record;
  }

  /**
   * Find outbox record by eventId (Tìm bản ghi outbox theo eventId)
   */
  async findOutboxByEventId(eventId: string): Promise<OutboxRecord | null> {
    for (const record of sharedOutbox.values()) {
      if (record.eventId === eventId) {
        return record;
      }
    }
    return null;
  }

  /**
   * Find outbox records by commandKey (Tìm bản ghi outbox theo commandKey)
   */
  async findOutboxByCommandKey(commandKey: string): Promise<OutboxRecord[]> {
    const records: OutboxRecord[] = [];
    for (const record of sharedOutbox.values()) {
      if (record.commandKey === commandKey && record.status === 'published') {
        records.push(record);
      }
    }
    return records;
  }

  /**
   * Mark outbox record as published (Đánh dấu bản ghi outbox đã phát hành)
   */
  async markOutboxPublished(outboxId: string): Promise<void> {
    const record = sharedOutbox.get(outboxId);
    if (record) {
      record.status = 'published';
      record.publishedAt = new Date().toISOString();
      sharedOutbox.set(outboxId, record);
    }
  }

  /**
   * Get pending outbox records (Lấy bản ghi outbox đang chờ)
   */
  async getPendingOutboxRecords(): Promise<OutboxRecord[]> {
    const records: OutboxRecord[] = [];
    for (const record of sharedOutbox.values()) {
      if (record.status === 'pending') {
        records.push(record);
      }
    }
    return records;
  }
}
