/**
 * Logger Factory (Nhà máy Logger)
 */

import type { AuditLogger } from '@dmf/infra';

class InMemoryAuditLogger implements AuditLogger {
  private logs: Array<Record<string, unknown>> = [];

  logCommandReceived(commandName: string, userId: string, role: string, requestId: string): void {
    this.logs.push({ type: 'command_received', commandName, userId, role, requestId, timestamp: new Date().toISOString() });
  }

  logCommandRejected(commandName: string, userId: string, role: string, reason: string, failureCategory: string): void {
    this.logs.push({ type: 'command_rejected', commandName, userId, role, reason, failureCategory, timestamp: new Date().toISOString() });
  }

  logEventEmitted(eventName: string, eventId: string, correlationId?: string): void {
    this.logs.push({ type: 'event_emitted', eventName, eventId, correlationId, timestamp: new Date().toISOString() });
  }

  logQueryAccess(endpoint: string, userId: string, role: string, entityId?: string): void {
    this.logs.push({ type: 'query_access', endpoint, userId, role, entityId, timestamp: new Date().toISOString() });
  }
}

export function createLogger(): AuditLogger {
  return new InMemoryAuditLogger();
}
