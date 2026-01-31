/**
 * Audit logging (Ghi log Kiểm toán)
 * 
 * Audit logging helpers per STEP 9B.
 */

import type { AuditLogger } from '@dmf/infra';

/**
 * Log command received (Ghi log lệnh nhận được)
 */
export function logCommandReceived(
  auditLogger: AuditLogger,
  commandName: string,
  userId: string,
  requestId: string,
  correlationId?: string
) {
  auditLogger.logCommandReceived(commandName, userId, requestId, correlationId);
}

/**
 * Log command rejected (Ghi log lệnh bị từ chối)
 */
export function logCommandRejected(
  auditLogger: AuditLogger,
  commandName: string,
  userId: string,
  requestId: string,
  failureCategory: string,
  failureReason?: string
) {
  auditLogger.logCommandRejected(
    commandName,
    userId,
    requestId,
    failureCategory,
    failureReason
  );
}

/**
 * Log event emitted (Ghi log sự kiện phát ra)
 */
export function logEventEmitted(
  auditLogger: AuditLogger,
  eventName: string,
  eventId: string,
  userId?: string
) {
  auditLogger.logEventEmitted(eventName, eventId, userId);
}

/**
 * Log query access (Ghi log truy cập truy vấn)
 */
export function logQueryAccess(
  auditLogger: AuditLogger,
  endpoint: string,
  userId: string,
  entityId?: string
) {
  auditLogger.logQueryAccess(endpoint, userId, entityId);
}
