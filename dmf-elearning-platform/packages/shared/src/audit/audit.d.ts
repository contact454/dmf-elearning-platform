/**
 * Audit Logging (Ghi nhật ký Kiểm toán)
 *
 * Structured audit logging for commands and operations.
 * No PII - only IDs and metadata.
 *
 * Note: AuditLogger type is provided by services that use this.
 * Services will import AuditLogger from @dmf/infra.
 */
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
export declare function logCommandAudit(auditLogger: AuditLogger, entry: AuditEntry): void;
/**
 * Create audit entry from command result
 */
export declare function createAuditEntry(commandName: string, context: {
    userId?: string;
    correlationId?: string;
    requestId?: string;
}, result: 'success' | 'failure', errorCode?: string): AuditEntry;
//# sourceMappingURL=audit.d.ts.map