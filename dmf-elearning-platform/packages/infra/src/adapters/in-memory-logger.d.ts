/**
 * In-memory Logger adapter (Bộ chuyển đổi Ghi log trong bộ nhớ)
 *
 * Simple console logger for MVP.
 * Enforces PII redaction (IDs only).
 */
import type { Logger, LogContext, AuditLogger } from '../logger.js';
export declare class InMemoryLogger implements Logger {
    /**
     * Log debug message (Ghi log debug)
     */
    debug(message: string, context?: LogContext): void;
    /**
     * Log info message (Ghi log thông tin)
     */
    info(message: string, context?: LogContext): void;
    /**
     * Log warning message (Ghi log cảnh báo)
     */
    warn(message: string, context?: LogContext): void;
    /**
     * Log error message (Ghi log lỗi)
     */
    error(message: string, error?: Error, context?: LogContext): void;
    /**
     * Internal log method (Phương thức log nội bộ)
     */
    private log;
}
/**
 * In-memory Audit Logger adapter (Bộ chuyển đổi Ghi log Kiểm toán trong bộ nhớ)
 */
export declare class InMemoryAuditLogger implements AuditLogger {
    private logs;
    /**
     * Log command received (Ghi log lệnh nhận được)
     */
    logCommandReceived(commandName: string, userId: string, requestId: string, correlationId?: string): void;
    /**
     * Log command rejected (Ghi log lệnh bị từ chối)
     */
    logCommandRejected(commandName: string, userId: string, requestId: string, failureCategory: string, failureReason?: string): void;
    /**
     * Log event emitted (Ghi log sự kiện phát ra)
     */
    logEventEmitted(eventName: string, eventId: string, userId?: string): void;
    /**
     * Log query access (Ghi log truy cập truy vấn)
     */
    logQueryAccess(endpoint: string, userId: string, entityId?: string): void;
    /**
     * Add log entry (Thêm mục log)
     */
    private addLog;
    /**
     * Get all logs (for testing) (Lấy tất cả logs - cho kiểm tra)
     */
    getLogs(): Array<{
        type: string;
        timestamp: string;
        data: Record<string, unknown>;
    }>;
    /**
     * Clear logs (for testing) (Xóa logs - cho kiểm tra)
     */
    clearLogs(): void;
}
//# sourceMappingURL=in-memory-logger.d.ts.map