/**
 * Dangerous Operation: Guardrails for risky operations
 * 
 * Phase 2 Track D: Admin Safety & Governance (Lightweight)
 * 
 * Defines guardrails for operations that could cause data loss or system instability.
 * These operations require:
 * - Confirmation (user must explicitly confirm)
 * - Audit (action must be logged)
 * - Restricted actors (only certain actor types can perform)
 */

import type { ActorType } from './ActorType.js';
import { ActorType as AT } from './ActorType.js';

/**
 * Dangerous operation definition
 */
export type DangerousOperation = {
  /**
   * Operation name
   */
  operation: 'delete' | 'override' | 'replay' | 'bulk_update' | 'policy_override';

  /**
   * Whether this operation requires explicit confirmation
   * 
   * If true, the operation must be confirmed by the user before execution.
   */
  requiresConfirmation: boolean;

  /**
   * Whether this operation must be audited
   * 
   * If true, an audit record must be created for this operation.
   */
  requiresAudit: boolean;

  /**
   * Actor types allowed to perform this operation
   * 
   * Only these actor types can perform the operation.
   */
  allowedActors: ActorType[];

  /**
   * Reason for this guardrail
   */
  reason?: string;
};

/**
 * Default dangerous operations and their guardrails
 */
export const DANGEROUS_OPERATIONS: DangerousOperation[] = [
  {
    operation: 'delete',
    requiresConfirmation: true,
    requiresAudit: true,
    allowedActors: [AT.ADMIN],
    reason: 'Deletion is irreversible and can cause data loss',
  },
  {
    operation: 'override',
    requiresConfirmation: true,
    requiresAudit: true,
    allowedActors: [AT.ADMIN],
    reason: 'Override bypasses normal validation and can cause inconsistencies',
  },
  {
    operation: 'replay',
    requiresConfirmation: true,
    requiresAudit: true,
    allowedActors: [AT.ADMIN, AT.SYSTEM],
    reason: 'Replay can modify system state and must be carefully controlled',
  },
  {
    operation: 'bulk_update',
    requiresConfirmation: true,
    requiresAudit: true,
    allowedActors: [AT.ADMIN],
    reason: 'Bulk updates affect multiple resources and can cause widespread changes',
  },
  {
    operation: 'policy_override',
    requiresConfirmation: true,
    requiresAudit: true,
    allowedActors: [AT.ADMIN],
    reason: 'Policy override bypasses enforcement and can affect learning outcomes',
  },
];

/**
 * Get dangerous operation definition
 */
export function getDangerousOperation(
  operation: DangerousOperation['operation']
): DangerousOperation | undefined {
  return DANGEROUS_OPERATIONS.find((op) => op.operation === operation);
}

/**
 * Check if an actor can perform a dangerous operation
 */
export function canPerformOperation(
  operation: DangerousOperation['operation'],
  actorType: ActorType
): boolean {
  const op = getDangerousOperation(operation);
  if (!op) {
    return false; // Unknown operation is not allowed
  }
  return op.allowedActors.includes(actorType);
}

/**
 * Validate dangerous operation before execution
 */
export function validateDangerousOperation(
  operation: DangerousOperation['operation'],
  actorType: ActorType,
  confirmed: boolean
): {
  allowed: boolean;
  errors: string[];
  warnings: string[];
} {
  const op = getDangerousOperation(operation);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!op) {
    errors.push(`Unknown dangerous operation: ${operation}`);
    return { allowed: false, errors, warnings };
  }

  // Check actor type
  if (!op.allowedActors.includes(actorType)) {
    errors.push(
      `Actor type ${actorType} is not allowed to perform ${operation}. Allowed actors: ${op.allowedActors.join(', ')}`
    );
  }

  // Check confirmation
  if (op.requiresConfirmation && !confirmed) {
    errors.push(`Operation ${operation} requires explicit confirmation`);
  }

  // Warnings
  if (op.requiresAudit) {
    warnings.push(`Operation ${operation} will be audited`);
  }

  return {
    allowed: errors.length === 0,
    errors,
    warnings,
  };
}