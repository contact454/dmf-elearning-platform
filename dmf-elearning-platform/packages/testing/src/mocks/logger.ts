/**
 * Mock Logger (Logger Giả lập)
 * For testing - captures log calls
 */

import type { Logger, AuditLogger, LogContext } from '@dmf/infra';

export class MockLogger implements Logger {
  private logs: Array<{ level: string; message: string; error?: Error; context?: LogContext }> = [];

  debug(message: string, context?: LogContext): void {
    this.logs.push({ level: 'debug', message, context });
  }

  info(message: string, context?: LogContext): void {
    this.logs.push({ level: 'info', message, context });
  }

  warn(message: string, context?: LogContext): void {
    this.logs.push({ level: 'warn', message, context });
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.logs.push({ level: 'error', message, error, context });
  }

  getLogs(): Array<{ level: string; message: string; error?: Error; context?: LogContext }> {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

export class MockAuditLogger implements AuditLogger {
  private auditLogs: Array<{
    type: string;
    commandName?: string;
    eventName?: string;
    endpoint?: string;
    userId: string;
    role?: string;
    requestId?: string;
    eventId?: string;
    correlationId?: string;
    entityId?: string;
    reason?: string;
    failureCategory?: string;
  }> = [];

  logCommandReceived(
    commandName: string,
    userId: string,
    requestId: string,
    correlationId?: string
  ): void {
    this.auditLogs.push({ type: 'command_received', commandName, userId, requestId, correlationId });
  }

  logCommandRejected(
    commandName: string,
    userId: string,
    requestId: string,
    failureCategory: string,
    failureReason?: string
  ): void {
    this.auditLogs.push({
      type: 'command_rejected',
      commandName,
      userId,
      requestId,
      failureCategory,
      reason: failureReason,
    });
  }

  logEventEmitted(eventName: string, eventId: string, userId?: string): void {
    // Set userId to 'system' if not provided (for system events)
    this.auditLogs.push({
      type: 'event_emitted',
      eventName,
      eventId,
      userId: userId || 'system',
    });
  }

  logQueryAccess(endpoint: string, userId: string, entityId?: string): void {
    this.auditLogs.push({ type: 'query_access', endpoint, userId, entityId });
  }

  getAuditLogs(): Array<Record<string, unknown>> {
    return [...this.auditLogs];
  }

  clear(): void {
    this.auditLogs = [];
  }
}
