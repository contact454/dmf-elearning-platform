/**
 * In-memory Idempotency Store adapter (Bộ chuyển đổi Kho Idempotency trong bộ nhớ)
 *
 * Simple in-memory implementation for MVP.
 */
export class InMemoryIdempotencyStore {
    store = new Map();
    /**
     * Get idempotency result (Lấy kết quả idempotency)
     */
    async get(key) {
        return this.store.get(key) || null;
    }
    /**
     * Set idempotency result (Đặt kết quả idempotency)
     */
    async set(key, result) {
        this.store.set(key, result);
    }
    /**
     * Check if key exists (Kiểm tra khóa tồn tại)
     */
    async exists(key) {
        return this.store.has(key);
    }
    /**
     * Clear all entries (for testing) (Xóa tất cả mục - cho kiểm tra)
     */
    clear() {
        this.store.clear();
    }
}
//# sourceMappingURL=in-memory-idempotency-store.js.map