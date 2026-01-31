/**
 * Audit Logging (Ghi nhật ký Kiểm toán)
 * 
 * Structured audit logging for commands and operations.
 * No PII - only IDs and metadata.
 * 
 * Note: AuditLogger type is provided by services that use this.
 * Services will import AuditLogger from @dmf/infra.
 */

// AuditLogger interface (services will import from @dmf/infra)
// Defined here to avoid circular dependencies
export interface AuditLogger {
  logCommandReceived(commandName: string, userId: string, requestId: string, correlationId?: string): void;
  logCommandRejected(commandName: string, userId: string, requestId: string, failureCategory: string, failureReason?: string): void;
  logEventEmitted(eventName: string, eventId: string, userId?: string): void;
  logQueryAccess(endpoint: string, userId: string, entityId?: string): void;
  log?(message: string): void;
}

export interface AuditEntry {
  commandName: string;
  userId?: string;
  correlationId?: string;
  timestamp: string;
  result: 'success' | 'failure';
  errorCode?: string;
  requestId?: string;
}

/**
 * Log command audit entry
 */
export function logCommandAudit(
  auditLogger: AuditLogger,
  entry: AuditEntry
): void {
  auditLogger.logCommandReceived(
    entry.commandName,
    entry.userId || '',
    entry.requestId || '',
    entry.correlationId
  );

  // Also log structured audit entry
  const auditLog = {
    type: 'command_audit',
    ...entry,
  };

  // Use auditLogger's internal logging mechanism
  // InMemoryAuditLogger should support structured logs
  (auditLogger as any).log?.(JSON.stringify(auditLog));
}

/**
 * Create audit entry from command result
 */
export function createAuditEntry(
  commandName: string,
  context: {
    userId?: string;
    correlationId?: string;
    requestId?: string;
  },
  result: 'success' | 'failure',
  errorCode?: string
): AuditEntry {
  return {
    commandName,
    userId: context.userId,
    correlationId: context.correlationId,
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
    result,
    errorCode,
  };
}
