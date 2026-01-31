/**
 * In-memory Idempotency Store adapter (Bộ chuyển đổi Kho Idempotency trong bộ nhớ)
 *
 * Simple in-memory implementation for MVP.
 */
import type { IdempotencyStore, IdempotencyResult } from '../idempotency-store.js';
export declare class InMemoryIdempotencyStore implements IdempotencyStore {
    private store;
    /**
     * Get idempotency result (Lấy kết quả idempotency)
     */
    get(key: string): Promise<IdempotencyResult | null>;
    /**
     * Set idempotency result (Đặt kết quả idempotency)
     */
    set(key: string, result: IdempotencyResult): Promise<void>;
    /**
     * Check if key exists (Kiểm tra khóa tồn tại)
     */
    exists(key: string): Promise<boolean>;
    /**
     * Clear all entries (for testing) (Xóa tất cả mục - cho kiểm tra)
     */
    clear(): void;
}
//# sourceMappingURL=in-memory-idempotency-store.d.ts.map