/**
 * In-memory Idempotency Store adapter (Bộ chuyển đổi Kho Idempotency trong bộ nhớ)
 * 
 * Simple in-memory implementation for MVP.
 */

import type { IdempotencyStore, IdempotencyResult } from '../idempotency-store.js';

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private store: Map<string, IdempotencyResult> = new Map();

  /**
   * Get idempotency result (Lấy kết quả idempotency)
   */
  async get(key: string): Promise<IdempotencyResult | null> {
    return this.store.get(key) || null;
  }

  /**
   * Set idempotency result (Đặt kết quả idempotency)
   */
  async set(key: string, result: IdempotencyResult): Promise<void> {
    this.store.set(key, result);
  }

  /**
   * Check if key exists (Kiểm tra khóa tồn tại)
   */
  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  /**
   * Clear all entries (for testing) (Xóa tất cả mục - cho kiểm tra)
   */
  clear(): void {
    this.store.clear();
  }
}
