/**
 * Idempotency helpers (Trợ giúp Idempotency)
 *
 * Helper functions for creating idempotency keys.
 */
/**
 * Make idempotency key from command name and correlation ID (Tạo khóa idempotency từ tên lệnh và correlation ID)
 *
 * @param commandName - Command name (e.g., "system.user.register")
 * @param correlationId - Correlation ID from command
 * @param userId - Optional user ID for natural key
 * @returns Idempotency key string
 */
export declare function makeIdempotencyKey(commandName: string, correlationId?: string, userId?: string): string;
/**
 * Make natural key for resource uniqueness (Tạo khóa tự nhiên cho tính duy nhất tài nguyên)
 *
 * Examples:
 * - Email uniqueness: "email:user@example.com"
 * - Enrollment uniqueness: "enrollment:userId:courseId"
 * - Attempt uniqueness: "attempt:userId:lessonId:in-progress"
 */
export declare function makeNaturalKey(...parts: string[]): string;
//# sourceMappingURL=idempotency-helpers.d.ts.map