/**
 * Evidence Enforcement Types (Các Loại Enforcement)
 * 
 * Enforcement levels and policy definitions.
 */

import type { EvidenceType } from '../evidence.types.js';

/**
 * Enforcement Level (Mức độ Enforcement)
 */
export type EnforcementLevel = 'observe' | 'soft_gate' | 'hard_gate';

/**
 * Default enforcement level for the system
 */
export const DEFAULT_ENFORCEMENT_LEVEL: EnforcementLevel = 'soft_gate';

/**
 * Action that triggers enforcement check
 */
export type EnforcementAction = 'start' | 'complete' | 'unlock_next';

/**
 * Required Evidence Definition
 */
export interface RequiredEvidence {
  type: EvidenceType;
  minCount: number;
}

/**
 * Evidence Policy (Chính sách Bằng chứng)
 */
export interface EvidencePolicy {
  id: string;
  scope: 'lesson' | 'course' | 'attempt';
  action: EnforcementAction;
  requiredEvidence: RequiredEvidence[];
  gracePeriodDays?: number; // Optional grace period before enforcement
  description?: string;
}

/**
 * Enforcement Check Result (Kết quả Kiểm tra Enforcement)
 */
export interface EnforcementResult {
  allowed: boolean;
  level: EnforcementLevel;
  reasons: string[];
  missingEvidence?: RequiredEvidence[];
  policyId?: string;
}
