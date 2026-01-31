/**
 * In-memory Outbox adapter (Bộ chuyển đổi Outbox trong bộ nhớ)
 *
 * Simple in-memory implementation for MVP.
 * Ensures write-then-emit safety (an toàn phát sự kiện).
 */
import type { Outbox, OutboxRecord } from '../outbox.js';
export declare class InMemoryOutbox implements Outbox {
    private records;
    /**
     * Create outbox record (Tạo bản ghi outbox)
     */
    create(record: OutboxRecord): Promise<OutboxRecord>;
    /**
     * Find outbox record by eventId (Tìm bản ghi outbox theo eventId)
     */
    findByEventId(eventId: string): Promise<OutboxRecord | null>;
    /**
     * Find published records by commandKey (Tìm bản ghi đã phát hành theo commandKey)
     */
    findPublishedByCommandKey(commandKey: string): Promise<OutboxRecord[]>;
    /**
     * Mark outbox record as published (Đánh dấu bản ghi outbox đã phát hành)
     */
    markPublished(outboxId: string): Promise<void>;
    /**
     * Get pending records (Lấy bản ghi đang chờ)
     */
    getPending(): Promise<OutboxRecord[]>;
    /**
     * Clear all records (for testing) (Xóa tất cả bản ghi - cho kiểm tra)
     */
    clear(): void;
}
//# sourceMappingURL=in-memory-outbox.d.ts.map