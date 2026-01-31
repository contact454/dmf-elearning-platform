/**
 * Evidence Status: Lifecycle states for EvidenceItem
 * 
 * Phase 2 Track B: Evidence System formalization
 * 
 * Evidence lifecycle:
 * 1. CREATED - EvidenceItem is created (e.g., speaking recording, writing submission)
 * 2. VALIDATED - Evidence passes validation (auto or manual review)
 * 3. EXPIRED - Evidence is no longer valid (timeout, SLA breach)
 * 4. REVOKED - Evidence is revoked (fraud detection, manual revocation)
 * 
 * Rule: Evidence is append-only. Status changes are recorded as events,
 * not by modifying the EvidenceItem itself.
 */

/**
 * Evidence status enum
 */
export enum EvidenceStatus {
  /**
   * EvidenceItem has been created but not yet validated
   * 
   * Default state for new evidence.
   * Evidence in this state may not count toward progress eligibility.
   */
  CREATED = 'created',

  /**
   * Evidence has been validated (auto or manual review)
   * 
   * Evidence in this state counts toward progress eligibility.
   * This is the "active" state for evidence.
   */
  VALIDATED = 'validated',

  /**
   * Evidence has expired (timeout, SLA breach)
   * 
   * Evidence that was created but never validated within the SLA period.
   * Expired evidence does not count toward progress eligibility.
   */
  EXPIRED = 'expired',

  /**
   * Evidence has been revoked (fraud detection, manual revocation)
   * 
   * Evidence that was validated but later found to be invalid or fraudulent.
   * Revoked evidence does not count toward progress eligibility.
   */
  REVOKED = 'revoked',
}

/**
 * Check if evidence status allows progress eligibility
 * 
 * Only VALIDATED evidence counts toward progress.
 */
export function isEvidenceEligible(status: EvidenceStatus): boolean {
  return status === EvidenceStatus.VALIDATED;
}

/**
 * Check if evidence status is terminal (no further transitions)
 * 
 * EXPIRED and REVOKED are terminal states.
 */
export function isTerminalStatus(status: EvidenceStatus): boolean {
  return status === EvidenceStatus.EXPIRED || status === EvidenceStatus.REVOKED;
}

/**
 * Get valid status transitions
 * 
 * Defines the allowed state machine transitions for evidence.
 */
export function getValidTransitions(from: EvidenceStatus): EvidenceStatus[] {
  switch (from) {
    case EvidenceStatus.CREATED:
      return [EvidenceStatus.VALIDATED, EvidenceStatus.EXPIRED];
    case EvidenceStatus.VALIDATED:
      return [EvidenceStatus.REVOKED];
    case EvidenceStatus.EXPIRED:
    case EvidenceStatus.REVOKED:
      return []; // Terminal states
    default:
      return [];
  }
}

/**
 * Check if a status transition is valid
 */
export function isValidTransition(from: EvidenceStatus, to: EvidenceStatus): boolean {
  return getValidTransitions(from).includes(to);
}