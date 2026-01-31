/**
 * In-memory Database adapter (Bộ chuyển đổi Cơ sở dữ liệu trong bộ nhớ)
 *
 * Simple in-memory key-value store for MVP.
 * Services use this for state persistence.
 */
import type { Database, DatabaseConnectionOptions } from '../database.js';
/**
 * Outbox record (Bản ghi Outbox)
 *
 * Represents a pending or published event in the outbox.
 */
export interface OutboxRecord {
    outboxId: string;
    commandKey?: string;
    eventId: string;
    eventName: string;
    payload: unknown;
    status: 'pending' | 'published';
    createdAt: string;
    publishedAt?: string;
}
export declare class InMemoryDatabase implements Database {
    private store;
    private outbox;
    private connected;
    /**
     * Connect to database (Kết nối cơ sở dữ liệu)
     */
    connect(_options: DatabaseConnectionOptions): Promise<void>;
    /**
     * Disconnect from database (Ngắt kết nối cơ sở dữ liệu)
     */
    disconnect(): Promise<void>;
    /**
     * Execute query (Thực thi truy vấn)
     *
     * Simple key-value operations for MVP.
     * Format: "SELECT * FROM table WHERE id = ?" or "INSERT INTO table VALUES ?"
     */
    query<T = unknown>(query: string, params?: unknown[]): Promise<T[]>;
    /**
     * Execute transaction (Thực thi giao dịch)
     */
    transaction<T>(callback: () => Promise<T>): Promise<T>;
    /**
     * Handle SELECT query (Xử lý truy vấn SELECT)
     */
    private handleSelect;
    /**
     * Handle INSERT query (Xử lý truy vấn INSERT)
     */
    private handleInsert;
    /**
     * Handle UPDATE query (Xử lý truy vấn UPDATE)
     */
    private handleUpdate;
    /**
     * Handle DELETE query (Xử lý truy vấn DELETE)
     */
    private handleDelete;
    /**
     * Get table (for testing) (Lấy bảng - cho kiểm tra)
     */
    getTable(tableName: string): Map<string, unknown> | undefined;
    /**
     * Clear all data (for testing) (Xóa tất cả dữ liệu - cho kiểm tra)
     */
    clear(): void;
    /**
     * Create outbox record (Tạo bản ghi outbox)
     *
     * Stores event in outbox as pending before publishing.
     */
    createOutboxRecord(record: OutboxRecord): Promise<OutboxRecord>;
    /**
     * Find outbox record by eventId (Tìm bản ghi outbox theo eventId)
     */
    findOutboxByEventId(eventId: string): Promise<OutboxRecord | null>;
    /**
     * Find outbox records by commandKey (Tìm bản ghi outbox theo commandKey)
     */
    findOutboxByCommandKey(commandKey: string): Promise<OutboxRecord[]>;
    /**
     * Mark outbox record as published (Đánh dấu bản ghi outbox đã phát hành)
     */
    markOutboxPublished(outboxId: string): Promise<void>;
    /**
     * Get pending outbox records (Lấy bản ghi outbox đang chờ)
     */
    getPendingOutboxRecords(): Promise<OutboxRecord[]>;
}
//# sourceMappingURL=in-memory-database.d.ts.map