/**
 * Evidence Store Port Interface
 * 
 * Phase 2 Sprint 1: SQLite Persistence (Opt-in)
 * 
 * Defines the contract for storing and querying evidence items.
 * Implementations can be in-memory (default) or SQLite (opt-in).
 * 
 * Note: This interface is in @dmf/infra to avoid circular dependencies.
 * Domain types (EvidenceItem, EvidenceStatus) are imported as types only.
 */

import type { EvidenceItem, EvidenceStatus } from '@dmf/evidence';

/**
 * Evidence Store interface
 */
export interface EvidenceStore {
  /**
   * Save an evidence item
   */
  save(evidence: EvidenceItem): Promise<void>;

  /**
   * Find evidence by ID
   */
  findById(evidenceId: string): Promise<EvidenceItem | null>;

  /**
   * Find evidence by user ID
   */
  findByUserId(userId: string): Promise<EvidenceItem[]>;

  /**
   * Find evidence by lesson ID
   */
  findByLessonId(lessonId: string): Promise<EvidenceItem[]>;

  /**
   * Find evidence by correlation ID
   */
  findByCorrelationId(correlationId: string): Promise<EvidenceItem[]>;

  /**
   * Update evidence status
   * 
   * Note: Evidence is append-only, so this creates a new record
   * linking the evidenceId to the new status.
   */
  updateStatus(evidenceId: string, status: EvidenceStatus, correlationId: string): Promise<void>;

  /**
   * Find evidence by status
   */
  findByStatus(status: EvidenceStatus): Promise<EvidenceItem[]>;
}
