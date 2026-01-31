/**
 * Policy Decision Store Port Interface
 * 
 * Phase 2 Sprint 1: SQLite Persistence (Opt-in)
 * 
 * Defines the contract for storing and querying policy decisions.
 * Implementations can be in-memory (default) or SQLite (opt-in).
 * 
 * Note: This interface is in @dmf/infra to avoid circular dependencies.
 * Domain types (PolicyDecision) are imported as types only.
 */

import type { PolicyDecision } from '@dmf/ops';

/**
 * Policy Decision Store interface
 */
export interface PolicyDecisionStore {
  /**
   * Save a policy decision
   */
  save(decision: PolicyDecision): Promise<void>;

  /**
   * Find decisions by policy ID
   */
  findByPolicyId(policyId: string): Promise<PolicyDecision[]>;

  /**
   * Find decisions by action
   */
  findByAction(action: string): Promise<PolicyDecision[]>;

  /**
   * Find decisions by correlation ID
   */
  findByCorrelationId(correlationId: string): Promise<PolicyDecision[]>;

  /**
   * Find decisions by actor user ID
   */
  findByActorUserId(actorUserId: string): Promise<PolicyDecision[]>;

  /**
   * Find decisions within time range
   */
  findByTimeRange(fromTimestamp: string, toTimestamp: string): Promise<PolicyDecision[]>;

  /**
   * Get decision by ID
   */
  findById(decisionId: string): Promise<PolicyDecision | null>;
}
