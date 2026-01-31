/**
 * Audit Store Port Interface
 * 
 * Phase 2 Sprint 1: SQLite Persistence (Opt-in)
 * 
 * Defines the contract for storing and querying audit records.
 * Implementations can be in-memory (default) or SQLite (opt-in).
 * 
 * Note: This interface is in @dmf/infra to avoid circular dependencies.
 * Domain types (AuditRecord) are imported as types only.
 */

import type { AuditRecord, AuditRecordFilter } from '@dmf/ops';

/**
 * Audit Store interface
 */
export interface AuditStore {
  /**
   * Save an audit record
   */
  save(record: AuditRecord): Promise<void>;

  /**
   * Find records by filter
   */
  find(filter: AuditRecordFilter): Promise<AuditRecord[]>;

  /**
   * Find record by ID
   */
  findById(auditId: string): Promise<AuditRecord | null>;

  /**
   * Find records by correlation ID
   */
  findByCorrelationId(correlationId: string): Promise<AuditRecord[]>;

  /**
   * Find records by actor user ID
   */
  findByActorUserId(actorUserId: string): Promise<AuditRecord[]>;

  /**
   * Find records by event name
   */
  findByEventName(eventName: string): Promise<AuditRecord[]>;
}
