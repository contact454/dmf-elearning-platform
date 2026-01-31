/**
 * Audit Logging (Ghi nhật ký Kiểm toán)
 *
 * Structured audit logging for commands and operations.
 * No PII - only IDs and metadata.
 *
 * Note: AuditLogger type is provided by services that use this.
 * Services will import AuditLogger from @dmf/infra.
 */
/**
 * Log command audit entry
 */
export function logCommandAudit(auditLogger, entry) {
    auditLogger.logCommandReceived(entry.commandName, entry.userId || '', entry.requestId || '', entry.correlationId);
    // Also log structured audit entry
    const auditLog = {
        type: 'command_audit',
        ...entry,
    };
    // Use auditLogger's internal logging mechanism
    // InMemoryAuditLogger should support structured logs
    auditLogger.log?.(JSON.stringify(auditLog));
}
/**
 * Create audit entry from command result
 */
export function createAuditEntry(commandName, context, result, errorCode) {
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
//# sourceMappingURL=audit.js.map