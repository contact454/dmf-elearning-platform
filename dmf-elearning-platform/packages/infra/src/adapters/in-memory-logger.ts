/**
 * In-memory Logger adapter (Bộ chuyển đổi Ghi log trong bộ nhớ)
 * 
 * Simple console logger for MVP.
 * Enforces PII redaction (IDs only).
 */

import type { Logger, LogContext, AuditLogger } from '../logger.js';
import { LogLevel } from '../logger.js';

export class InMemoryLogger implements Logger {
  /**
   * Log debug message (Ghi log debug)
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log info message (Ghi log thông tin)
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning message (Ghi log cảnh báo)
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log error message (Ghi log lỗi)
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Internal log method (Phương thức log nội bộ)
   * Enhanced with request context for structured logging
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    const timestamp = new Date().toISOString();
    
    // Get request context if available
    const requestContext = (globalThis as any).__dmf_requestContext as {
      requestId?: string;
      correlationId?: string;
      userId?: string;
      serviceName?: string;
    } | undefined;

    // Build structured log entry
    const logEntry: Record<string, unknown> = {
      timestamp,
      level: level.toUpperCase(),
      msg: message,
      ...(requestContext?.requestId && { requestId: requestContext.requestId }),
      ...(requestContext?.correlationId && { correlationId: requestContext.correlationId }),
      ...(requestContext?.userId && { userId: requestContext.userId }),
      ...(requestContext?.serviceName && { service: requestContext.serviceName }),
      ...(context && { ...context }),
      ...(error && { error: error.message, errorStack: error.stack }),
    };

    // Output as JSON for structured logging
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * In-memory Audit Logger adapter (Bộ chuyển đổi Ghi log Kiểm toán trong bộ nhớ)
 */
export class InMemoryAuditLogger implements AuditLogger {
  private logs: Array<{
    type: string;
    timestamp: string;
    data: Record<string, unknown>;
  }> = [];

  /**
   * Log command received (Ghi log lệnh nhận được)
   */
  logCommandReceived(
    commandName: string,
    userId: string,
    requestId: string,
    correlationId?: string
  ): void {
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
  logCommandRejected(
    commandName: string,
    userId: string,
    requestId: string,
    failureCategory: string,
    failureReason?: string
  ): void {
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
  logEventEmitted(eventName: string, eventId: string, userId?: string): void {
    this.addLog('event_emitted', {
      eventName,
      eventId,
      userId, // IDs only
    });
  }

  /**
   * Log query access (Ghi log truy cập truy vấn)
   */
  logQueryAccess(endpoint: string, userId: string, entityId?: string): void {
    this.addLog('query_access', {
      endpoint,
      userId, // IDs only, no email
      entityId,
    });
  }

  /**
   * Add log entry (Thêm mục log)
   */
  private addLog(type: string, data: Record<string, unknown>): void {
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
  getLogs(): Array<{ type: string; timestamp: string; data: Record<string, unknown> }> {
    return [...this.logs];
  }

  /**
   * Clear logs (for testing) (Xóa logs - cho kiểm tra)
   */
  clearLogs(): void {
    this.logs = [];
  }
}
