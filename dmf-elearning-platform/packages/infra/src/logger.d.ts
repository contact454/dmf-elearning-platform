/**
 * Logger interface (Giao diện Ghi log)
 *
 * This interface enforces PII redaction (no email, no tokens, no raw answers).
 * All log methods accept IDs only.
 */
/**
 * Log level (Mức độ log)
 */
export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}
/**
 * Log context (Ngữ cảnh log)
 *
 * Contains IDs only (no PII).
 */
export interface LogContext {
    userId?: string;
    requestId?: string;
    correlationId?: string;
    entityId?: string;
    [key: string]: string | number | boolean | undefined;
}
/**
 * Logger interface (Giao diện Ghi log)
 *
 * Services implement this interface with concrete adapters.
 * All methods enforce PII redaction (IDs only).
 */
export interface Logger {
    /**
     * Log debug message (Ghi log debug)
     *
     * @param message - Log message
     * @param context - Log context (IDs only, no PII)
     */
    debug(message: string, context?: LogContext): void;
    /**
     * Log info message (Ghi log thông tin)
     *
     * @param message - Log message
     * @param context - Log context (IDs only, no PII)
     */
    info(message: string, context?: LogContext): void;
    /**
     * Log warning message (Ghi log cảnh báo)
     *
     * @param message - Log message
     * @param context - Log context (IDs only, no PII)
     */
    warn(message: string, context?: LogContext): void;
    /**
     * Log error message (Ghi log lỗi)
     *
     * @param message - Log message
     * @param error - Error object (if applicable)
     * @param context - Log context (IDs only, no PII)
     */
    error(message: string, error?: Error, context?: LogContext): void;
}
/**
 * Audit logger interface (Giao diện Ghi log Kiểm toán)
 *
 * Specialized logger for audit logs (STEP 9B).
 * Enforces stricter redaction rules.
 */
export interface AuditLogger {
    /**
     * Log command received (Ghi log lệnh nhận được)
     *
     * @param commandName - Command name
     * @param userId - User ID (not email)
     * @param requestId - Request ID
     * @param correlationId - Correlation ID (if present)
     */
    logCommandReceived(commandName: string, userId: string, requestId: string, correlationId?: string): void;
    /**
     * Log command rejected (Ghi log lệnh bị từ chối)
     *
     * @param commandName - Command name
     * @param userId - User ID (not email)
     * @param requestId - Request ID
     * @param failureCategory - Failure category (STEP 4.4)
     * @param failureReason - Failure reason (no PII)
     */
    logCommandRejected(commandName: string, userId: string, requestId: string, failureCategory: string, failureReason?: string): void;
    /**
     * Log event emitted (Ghi log sự kiện phát ra)
     *
     * @param eventName - Event name
     * @param eventId - Event ID
     * @param userId - User ID (if applicable)
     */
    logEventEmitted(eventName: string, eventId: string, userId?: string): void;
    /**
     * Log query access (Ghi log truy cập truy vấn)
     *
     * @param endpoint - Query endpoint
     * @param userId - User ID (not email)
     * @param entityId - Entity ID accessed (if applicable)
     */
    logQueryAccess(endpoint: string, userId: string, entityId?: string): void;
}
//# sourceMappingURL=logger.d.ts.map