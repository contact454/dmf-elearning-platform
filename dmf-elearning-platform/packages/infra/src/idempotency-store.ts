/**
 * Idempotency Store interface (Giao diện Kho Idempotency)
 * 
 * Stores command execution results for idempotency checks.
 * Maps (commandName + correlationId) -> {resultIds, emittedEventIds}
 */

/**
 * Idempotency result (Kết quả Idempotency)
 */
export interface IdempotencyResult {
  resultIds: Record<string, string>; // e.g., { userId: "...", attemptId: "..." }
  emittedEventIds: string[]; // Event IDs that were emitted
  timestamp: string; // ISO 8601
}

/**
 * Idempotency Store interface (Giao diện Kho Idempotency)
 */
export interface IdempotencyStore {
  /**
   * Get idempotency result (Lấy kết quả idempotency)
   * 
   * @param key - Idempotency key (commandName + correlationId or natural key)
   * @returns Result if exists, null otherwise
   */
  get(key: string): Promise<IdempotencyResult | null>;

  /**
   * Set idempotency result (Đặt kết quả idempotency)
   * 
   * @param key - Idempotency key
   * @param result - Result to store
   */
  set(key: string, result: IdempotencyResult): Promise<void>;

  /**
   * Check if key exists (Kiểm tra khóa tồn tại)
   * 
   * @param key - Idempotency key
   * @returns true if exists
   */
  exists(key: string): Promise<boolean>;
}
