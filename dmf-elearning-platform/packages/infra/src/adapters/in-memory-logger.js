/**
 * In-memory Logger adapter (Bộ chuyển đổi Ghi log trong bộ nhớ)
 *
 * Simple console logger for MVP.
 * Enforces PII redaction (IDs only).
 */
import { LogLevel } from '../logger.js';
export class InMemoryLogger {
    /**
     * Log debug message (Ghi log debug)
     */
    debug(message, context) {
        this.log(LogLevel.DEBUG, message, context);
    }
    /**
     * Log info message (Ghi log thông tin)
     */
    info(message, context) {
        this.log(LogLevel.INFO, message, context);
    }
    /**
     * Log warning message (Ghi log cảnh báo)
     */
    warn(message, context) {
        this.log(LogLevel.WARN, message, context);
    }
    /**
     * Log error message (Ghi log lỗi)
     */
    error(message, error, context) {
        this.log(LogLevel.ERROR, message, context, error);
    }
    /**
     * Internal log method (Phương thức log nội bộ)
     */
    log(level, message, context, error) {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` ${JSON.stringify(context)}` : '';
        const errorStr = error ? ` ${error.message}` : '';
        console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}${errorStr}`);
    }
}
/**
 * In-memory Audit Logger adapter (Bộ chuyển đổi Ghi log Kiểm toán trong bộ nhớ)
 */
export class InMemoryAuditLogger {
    logs = [];
    /**
     * Log command received (Ghi log lệnh nhận được)
     */
    logCommandReceived(commandName, userId, requestId, correlationId) {
        this.addLog('command_received', {
            commandName,
            userId, // IDs only, no email
            requestId,
            correlationId,
        });
    }
    /**
     * Log command rejected (Ghi log lệnh bị từ chối)
     */
    logCommandRejected(commandName, userId, requestId, failureCategory, failureReason) {
        this.addLog('command_rejected', {
            commandName,
            userId, // IDs only, no email
            requestId,
            failureCategory,
            failureReason, // No PII
        });
    }
    /**
     * Log event emitted (Ghi log sự kiện phát ra)
     */
    logEventEmitted(eventName, eventId, userId) {
        this.addLog('event_emitted', {
            eventName,
            eventId,
            userId, // IDs only
        });
    }
    /**
     * Log query access (Ghi log truy cập truy vấn)
     */
    logQueryAccess(endpoint, userId, entityId) {
        this.addLog('query_access', {
            endpoint,
            userId, // IDs only, no email
            entityId,
        });
    }
    /**
     * Add log entry (Thêm mục log)
     */
    addLog(type, data) {
        this.logs.push({
            type,
            timestamp: new Date().toISOString(),
            data,
        });
        // Also log to console for MVP (Ghi log vào console cho MVP)
        console.log(`[AUDIT] ${type}:`, JSON.stringify(data));
    }
    /**
     * Get all logs (for testing) (Lấy tất cả logs - cho kiểm tra)
     */
    getLogs() {
        return [...this.logs];
    }
    /**
     * Clear logs (for testing) (Xóa logs - cho kiểm tra)
     */
    clearLogs() {
        this.logs = [];
    }
}
//# sourceMappingURL=in-memory-logger.js.map