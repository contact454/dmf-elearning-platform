/**
 * Outbox interface (Giao diện Outbox)
 *
 * Defines outbox operations for safe event emission (write-then-emit pattern).
 */
/**
 * Outbox record (Bản ghi Outbox)
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
/**
 * Outbox interface (Giao diện Outbox)
 */
export interface Outbox {
    /**
     * Create outbox record (Tạo bản ghi outbox)
     *
     * Stores event in outbox as pending before publishing.
     */
    create(record: OutboxRecord): Promise<OutboxRecord>;
    /**
     * Find outbox record by eventId (Tìm bản ghi outbox theo eventId)
     */
    findByEventId(eventId: string): Promise<OutboxRecord | null>;
    /**
     * Find published records by commandKey (Tìm bản ghi đã phát hành theo commandKey)
     *
     * Used to check if event was already published for a command.
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
}
//# sourceMappingURL=outbox.d.ts.map