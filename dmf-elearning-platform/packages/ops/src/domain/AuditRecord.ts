/**
 * Audit Record: Structured audit trail for operations
 * 
 * Phase 2 Track C: Ops Visibility & Policy Enforcement
 * 
 * Provides structured, queryable audit records for:
 * - Who did what, when, and why
 * - Admin actions and their consequences
 * - System events and their triggers
 * - Policy decisions and enforcement actions
 */

import type { ActorType } from './ActorType.js';

/**
 * Audit record
 * 
 * Created for every significant action in the system.
 */
export type AuditRecord = {
  /**
   * Unique audit ID
   */
  auditId: string;

  /**
   * Event name that triggered this audit record
   * 
   * Examples:
   * - 'learning.lesson.completed'
   * - 'policy.hard_gate.updated'
   * - 'ops.degrade.activated'
   */
  eventName: string;

  /**
   * Actor type who performed the action
   */
  actorType: ActorType;

  /**
   * Actor user ID (if applicable)
   * 
   * - For 'admin' or 'mentor': userId
   * - For 'system' or 'automation': undefined
   */
  actorUserId?: string;

  /**
   * Action performed
   * 
   * Examples:
   * - 'lesson.complete'
   * - 'policy.update'
   * - 'degrade.activate'
   */
  action: string;

  /**
   * Resource type affected
   * 
   * Examples:
   * - 'lesson'
   * - 'policy'
   * - 'system'
   */
  resourceType: string;

  /**
   * Resource ID affected
   */
  resourceId: string;

  /**
   * Timestamp when action occurred
   */
  timestamp: string;

  /**
   * Correlation ID for tracing
   */
  correlationId: string;

  /**
   * Additional metadata (optional)
   * 
   * May include:
   * - Policy decision details
   * - Evidence counts
   * - System state at time of action
   */
  metadata?: Record<string, unknown>;
};

/**
 * Create an audit record
 */
export function createAuditRecord(
  params: Omit<AuditRecord, 'auditId' | 'timestamp'>
): AuditRecord {
  return {
    auditId: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...params,
  };
}

/**
 * Audit record query filters
 */
export type AuditRecordFilter = {
  actorType?: ActorType;
  actorUserId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  eventName?: string;
  fromTimestamp?: string;
  toTimestamp?: string;
  correlationId?: string;
};

/**
 * Filter audit records
 */
export function filterAuditRecords(
  records: AuditRecord[],
  filter: AuditRecordFilter
): AuditRecord[] {
  return records.filter((record) => {
    if (filter.actorType && record.actorType !== filter.actorType) {
      return false;
    }
    if (filter.actorUserId && record.actorUserId !== filter.actorUserId) {
      return false;
    }
    if (filter.action && record.action !== filter.action) {
      return false;
    }
    if (filter.resourceType && record.resourceType !== filter.resourceType) {
      return false;
    }
    if (filter.resourceId && record.resourceId !== filter.resourceId) {
      return false;
    }
    if (filter.eventName && record.eventName !== filter.eventName) {
      return false;
    }
    if (filter.fromTimestamp && record.timestamp < filter.fromTimestamp) {
      return false;
    }
    if (filter.toTimestamp && record.timestamp > filter.toTimestamp) {
      return false;
    }
    if (filter.correlationId && record.correlationId !== filter.correlationId) {
      return false;
    }
    return true;
  });
}