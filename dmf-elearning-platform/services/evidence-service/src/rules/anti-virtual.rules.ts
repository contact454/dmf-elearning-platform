/**
 * Anti-Virtual Learning Rules (Quy tắc Chống Học Ảo)
 * 
 * DRAFT ONLY - Not enforced yet.
 * These rules check for evidence violations but do NOT block progress.
 */

import type { EvidenceSummary } from '@dmf/evidence';

export interface RuleViolation {
  violated: boolean;
  reasons: string[];
}

/**
 * Check if lesson completion has required evidence
 */
export function checkLessonCompletionEvidence(summary: EvidenceSummary): RuleViolation {
  const reasons: string[] = [];

  // Rule: Lesson completed but no attendance evidence
  if (summary.evidenceCounts.attendance === 0) {
    reasons.push('Lesson completed but no attendance evidence');
  }

  // Rule: No activity submissions
  if (summary.evidenceCounts.activity_submission === 0 && summary.totalEvidence > 0) {
    reasons.push('No activity submission evidence');
  }

  return {
    violated: reasons.length > 0,
    reasons,
  };
}

/**
 * Check if speaking level has teacher validation
 */
export function checkSpeakingValidationEvidence(
  summary: EvidenceSummary,
  requiredLevel?: string
): RuleViolation {
  const reasons: string[] = [];

  // Rule: B1+ speaking but no teacher validation
  if (requiredLevel && ['B1', 'B2', 'C1', 'C2'].includes(requiredLevel)) {
    if (summary.evidenceCounts.teacher_validation === 0) {
      reasons.push(`Speaking level ${requiredLevel} requires teacher validation`);
    }
  }

  return {
    violated: reasons.length > 0,
    reasons,
  };
}

/**
 * Check if progress has recent evidence (within N days)
 */
export function checkRecentEvidence(
  summary: EvidenceSummary,
  daysThreshold: number = 7
): RuleViolation {
  const reasons: string[] = [];

  if (!summary.lastEvidenceAt) {
    reasons.push(`No evidence in the last ${daysThreshold} days`);
    return {
      violated: true,
      reasons,
    };
  }

  const lastEvidenceDate = new Date(summary.lastEvidenceAt);
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

  if (lastEvidenceDate < thresholdDate) {
    reasons.push(`No evidence in the last ${daysThreshold} days (last: ${summary.lastEvidenceAt})`);
  }

  return {
    violated: reasons.length > 0,
    reasons,
  };
}

/**
 * Check all anti-virtual learning rules
 */
export function checkAllRules(summary: EvidenceSummary, options?: {
  requiredLevel?: string;
  daysThreshold?: number;
}): RuleViolation {
  const allReasons: string[] = [];

  const completionCheck = checkLessonCompletionEvidence(summary);
  allReasons.push(...completionCheck.reasons);

  const validationCheck = checkSpeakingValidationEvidence(summary, options?.requiredLevel);
  allReasons.push(...validationCheck.reasons);

  const recentCheck = checkRecentEvidence(summary, options?.daysThreshold);
  allReasons.push(...recentCheck.reasons);

  return {
    violated: allReasons.length > 0,
    reasons: allReasons,
  };
}
