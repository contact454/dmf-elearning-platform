/**
 * Logger Factory (Nhà máy Logger)
 * Creates audit logger instance
 */

import type { AuditLogger } from '@dmf/infra';

// In-memory audit logger for MVP skeleton
class InMemoryAuditLogger implements AuditLogger {
  private logs: Array<Record<string, unknown>> = [];

  logCommandReceived(commandName: string, userId: string, role: string, requestId: string): void {
    this.logs.push({
      type: 'command_received',
      commandName,
      userId, // Allowed - ID only
      role, // Allowed
      requestId, // Allowed
      timestamp: new Date().toISOString(),
    });
  }

  logCommandRejected(
    commandName: string,
    userId: string,
    role: string,
    reason: string,
    failureCategory: string
  ): void {
    this.logs.push({
      type: 'command_rejected',
      commandName,
      userId,
      role,
      reason, // Generic reason only, no PII
      failureCategory,
      timestamp: new Date().toISOString(),
    });
  }

  logEventEmitted(eventName: string, eventId: string, correlationId?: string): void {
    this.logs.push({
      type: 'event_emitted',
      eventName,
      eventId, // Allowed - ID only
      correlationId, // Allowed - ID only
      timestamp: new Date().toISOString(),
    });
  }

  logQueryAccess(endpoint: string, userId: string, role: string, entityId?: string): void {
    this.logs.push({
      type: 'query_access',
      endpoint,
      userId, // Allowed - ID only
      role, // Allowed
      entityId, // Allowed - ID only
      timestamp: new Date().toISOString(),
    });
  }

  getLogs(): Array<Record<string, unknown>> {
    return [...this.logs];
  }
}

export function createLogger(): AuditLogger {
  return new InMemoryAuditLogger();
}
