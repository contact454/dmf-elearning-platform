/**
 * Evidence Lifecycle: Rules and mapping for evidence-to-progress
 * 
 * Phase 2 Track B: Evidence System formalization
 * 
 * Defines:
 * - Evidence lifecycle rules (when evidence transitions states)
 * - Evidence-to-progress mapping (which progress requires which evidence)
 * - Evidence-to-enforcement mapping (soft gate vs hard gate)
 */

import type { EvidenceType } from '../evidence.types.js';
import { EvidenceStatus } from './EvidenceStatus.js';

/**
 * Evidence-to-progress mapping rule
 * 
 * Defines which evidence types are required for specific progress actions.
 */
export type EvidenceRequirement = {
  /**
   * Progress action that requires evidence (e.g., 'lesson.complete', 'b1.speaking')
   */
  progressAction: string;

  /**
   * Evidence types required for this progress action
   */
  requiredEvidenceTypes: EvidenceType[];

  /**
   * Minimum count of each evidence type required
   * 
   * Default: 1
   */
  minCount?: number;

  /**
   * Whether this is a hard requirement (hard gate) or soft requirement (soft gate)
   * 
   * Hard gate: Progress is blocked if evidence is missing
   * Soft gate: Progress is allowed but warning is logged
   */
  enforcementLevel: 'hard' | 'soft';

  /**
   * Reason for this requirement
   */
  reason?: string;
};

/**
 * Default evidence requirements for common progress actions
 */
export const DEFAULT_EVIDENCE_REQUIREMENTS: EvidenceRequirement[] = [
  {
    progressAction: 'lesson.complete',
    requiredEvidenceTypes: ['activity_submission'],
    minCount: 1,
    enforcementLevel: 'soft',
    reason: 'Lesson completion should have at least one activity submission',
  },
  {
    progressAction: 'b1.speaking',
    requiredEvidenceTypes: ['speaking', 'teacher_validation'],
    minCount: 1,
    enforcementLevel: 'hard',
    reason: 'B1 speaking certification requires validated speaking evidence',
  },
  {
    progressAction: 'lesson.start',
    requiredEvidenceTypes: [],
    enforcementLevel: 'soft',
    reason: 'Lesson start does not require evidence (observation only)',
  },
];

/**
 * Get evidence requirements for a progress action
 */
export function getEvidenceRequirements(progressAction: string): EvidenceRequirement[] {
  return DEFAULT_EVIDENCE_REQUIREMENTS.filter((r) => r.progressAction === progressAction);
}

/**
 * Check if evidence meets requirements for a progress action
 * 
 * @param progressAction Progress action to check
 * @param evidenceCounts Map of evidence type to count (only VALIDATED evidence counts)
 * @returns Whether evidence requirements are met
 */
export function meetsEvidenceRequirements(
  progressAction: string,
  evidenceCounts: Map<EvidenceType, number>
): {
  met: boolean;
  missing: Array<{ type: EvidenceType; required: number; actual: number }>;
  warnings: string[];
} {
  const requirements = getEvidenceRequirements(progressAction);
  const missing: Array<{ type: EvidenceType; required: number; actual: number }> = [];
  const warnings: string[] = [];

  for (const req of requirements) {
    for (const evidenceType of req.requiredEvidenceTypes) {
      const required = req.minCount ?? 1;
      const actual = evidenceCounts.get(evidenceType) ?? 0;

      if (actual < required) {
        missing.push({ type: evidenceType, required, actual });

        if (req.enforcementLevel === 'hard') {
          warnings.push(
            `Hard gate: Missing ${required} ${evidenceType} evidence for ${progressAction}`
          );
        } else {
          warnings.push(
            `Soft gate: Missing ${required} ${evidenceType} evidence for ${progressAction} (warning only)`
          );
        }
      }
    }
  }

  const met = missing.length === 0;

  return { met, missing, warnings };
}

/**
 * Evidence lifecycle rule: When evidence transitions states
 * 
 * These rules define when evidence automatically transitions states
 * (e.g., auto-expire after SLA timeout).
 */
export type EvidenceLifecycleRule = {
  /**
   * Evidence type this rule applies to
   */
  evidenceType: EvidenceType;

  /**
   * Status transition this rule handles
   */
  fromStatus: EvidenceStatus;
  toStatus: EvidenceStatus;

  /**
   * Condition for transition (e.g., timeout, SLA breach)
   */
  condition: {
    type: 'timeout' | 'sla_breach' | 'manual';
    timeoutMs?: number; // For timeout conditions
  };

  /**
   * Whether this transition is automatic or manual
   */
  automatic: boolean;
};

/**
 * Default lifecycle rules
 */
export const DEFAULT_LIFECYCLE_RULES: EvidenceLifecycleRule[] = [
  {
    evidenceType: 'speaking',
    fromStatus: EvidenceStatus.CREATED,
    toStatus: EvidenceStatus.EXPIRED,
    condition: {
      type: 'timeout',
      timeoutMs: 72 * 60 * 60 * 1000, // 72 hours
    },
    automatic: true,
  },
  {
    evidenceType: 'writing',
    fromStatus: EvidenceStatus.CREATED,
    toStatus: EvidenceStatus.EXPIRED,
    condition: {
      type: 'timeout',
      timeoutMs: 72 * 60 * 60 * 1000, // 72 hours
    },
    automatic: true,
  },
];

/**
 * Get lifecycle rules for an evidence type
 */
export function getLifecycleRules(evidenceType: EvidenceType): EvidenceLifecycleRule[] {
  return DEFAULT_LIFECYCLE_RULES.filter((r) => r.evidenceType === evidenceType);
}