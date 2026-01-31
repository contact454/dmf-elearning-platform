/**
 * Error helpers (Trợ giúp Lỗi)
 *
 * Standardized error creation per STEP 4.4 failure categories.
 * Each helper creates an error object with code, category, message, and optional details.
 */
/**
 * Error category (Loại lỗi)
 * From STEP 4.4 (command-failure-semantics.md)
 */
export declare enum ErrorCategory {
    VALIDATION_ERROR = "ValidationError",
    NOT_FOUND = "NotFound",
    FORBIDDEN = "Forbidden",
    CONFLICT = "Conflict",
    IDEMPOTENT_REPLAY = "IdempotentReplay",
    TRANSIENT_FAILURE = "TransientFailure"
}
/**
 * Standard error object (Đối tượng Lỗi Chuẩn)
 */
export interface StandardError {
    code: string;
    category: ErrorCategory;
    message: string;
    details?: Record<string, unknown>;
}
/**
 * Create ValidationError (Tạo Lỗi Xác thực)
 *
 * Used for invalid input (payload validation, format errors).
 * Maps to HTTP 400.
 */
export declare function makeValidationError(details: string | Record<string, unknown>): StandardError;
/**
 * Create NotFound error (Tạo Lỗi Không Tìm Thấy)
 *
 * Used when entity does not exist OR ownership check fails (hide existence per STEP 8B).
 * Maps to HTTP 404.
 */
export declare function makeNotFound(entity: string, id?: string): StandardError;
/**
 * Create Forbidden error (Tạo Lỗi Cấm)
 *
 * Used ONLY for role violations (per STEP 8B).
 * Maps to HTTP 403.
 */
export declare function makeForbidden(role?: string, permission?: string): StandardError;
/**
 * Create Conflict error (Tạo Lỗi Xung Đột)
 *
 * Used when resource already exists or state conflict.
 * Maps to HTTP 409.
 */
export declare function makeConflict(reason: string): StandardError;
/**
 * Create IdempotentReplay result (Tạo Kết quả Phát lại Idempotent)
 *
 * Used when command was already processed (same correlationId).
 * Maps to HTTP 200/201 with replayed flag.
 */
export declare function makeIdempotentReplay(reference: Record<string, string>): StandardError & {
    replayed: true;
};
/**
 * Create TransientFailure error (Tạo Lỗi Tạm Thời)
 *
 * Used for retryable failures (service unavailable, timeout).
 * Maps to HTTP 503.
 */
export declare function makeTransientFailure(reason: string): StandardError;
/**
 * Map error category to HTTP status code (Ánh xạ loại lỗi sang mã trạng thái HTTP)
 *
 * Per STEP 4.4 and STEP 8B:
 * - ValidationError -> 400
 * - NotFound -> 404 (including ownership failures to hide existence)
 * - Forbidden -> 403 (role violations only)
 * - Conflict -> 409
 * - IdempotentReplay -> 200/201 (with replayed flag)
 * - TransientFailure -> 503
 */
export declare function getHttpStatusCode(error: StandardError, defaultCreated?: boolean): number;
//# sourceMappingURL=index.d.ts.map