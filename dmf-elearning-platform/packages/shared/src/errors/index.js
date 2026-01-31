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
export var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["VALIDATION_ERROR"] = "ValidationError";
    ErrorCategory["NOT_FOUND"] = "NotFound";
    ErrorCategory["FORBIDDEN"] = "Forbidden";
    ErrorCategory["CONFLICT"] = "Conflict";
    ErrorCategory["IDEMPOTENT_REPLAY"] = "IdempotentReplay";
    ErrorCategory["TRANSIENT_FAILURE"] = "TransientFailure";
})(ErrorCategory || (ErrorCategory = {}));
/**
 * Create ValidationError (Tạo Lỗi Xác thực)
 *
 * Used for invalid input (payload validation, format errors).
 * Maps to HTTP 400.
 */
export function makeValidationError(details) {
    return {
        code: 'VALIDATION_ERROR',
        category: ErrorCategory.VALIDATION_ERROR,
        message: typeof details === 'string' ? details : 'Validation failed',
        details: typeof details === 'object' ? details : { reason: details },
    };
}
/**
 * Create NotFound error (Tạo Lỗi Không Tìm Thấy)
 *
 * Used when entity does not exist OR ownership check fails (hide existence per STEP 8B).
 * Maps to HTTP 404.
 */
export function makeNotFound(entity, id) {
    return {
        code: 'NOT_FOUND',
        category: ErrorCategory.NOT_FOUND,
        message: `${entity} not found`,
        details: id ? { entity, id } : { entity },
    };
}
/**
 * Create Forbidden error (Tạo Lỗi Cấm)
 *
 * Used ONLY for role violations (per STEP 8B).
 * Maps to HTTP 403.
 */
export function makeForbidden(role, permission) {
    return {
        code: 'FORBIDDEN',
        category: ErrorCategory.FORBIDDEN,
        message: 'Forbidden: insufficient permissions',
        details: {
            ...(role && { role }),
            ...(permission && { permission }),
        },
    };
}
/**
 * Create Conflict error (Tạo Lỗi Xung Đột)
 *
 * Used when resource already exists or state conflict.
 * Maps to HTTP 409.
 */
export function makeConflict(reason) {
    return {
        code: 'CONFLICT',
        category: ErrorCategory.CONFLICT,
        message: `Conflict: ${reason}`,
        details: { reason },
    };
}
/**
 * Create IdempotentReplay result (Tạo Kết quả Phát lại Idempotent)
 *
 * Used when command was already processed (same correlationId).
 * Maps to HTTP 200/201 with replayed flag.
 */
export function makeIdempotentReplay(reference) {
    return {
        code: 'IDEMPOTENT_REPLAY',
        category: ErrorCategory.IDEMPOTENT_REPLAY,
        message: 'Command already processed (idempotent replay)',
        details: { reference },
        replayed: true,
    };
}
/**
 * Create TransientFailure error (Tạo Lỗi Tạm Thời)
 *
 * Used for retryable failures (service unavailable, timeout).
 * Maps to HTTP 503.
 */
export function makeTransientFailure(reason) {
    return {
        code: 'TRANSIENT_FAILURE',
        category: ErrorCategory.TRANSIENT_FAILURE,
        message: `Service temporarily unavailable: ${reason}`,
        details: { reason },
    };
}
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
export function getHttpStatusCode(error, defaultCreated = false) {
    switch (error.category) {
        case ErrorCategory.VALIDATION_ERROR:
            return 400;
        case ErrorCategory.NOT_FOUND:
            return 404;
        case ErrorCategory.FORBIDDEN:
            return 403;
        case ErrorCategory.CONFLICT:
            return 409;
        case ErrorCategory.IDEMPOTENT_REPLAY:
            return defaultCreated ? 201 : 200;
        case ErrorCategory.TRANSIENT_FAILURE:
            return 503;
        default:
            return 500;
    }
}
//# sourceMappingURL=index.js.map