/**
 * Evidence Enforcement Engine (Công cụ Enforcement Bằng chứng)
 * 
 * Checks if learning progress is allowed based on evidence policies.
 */

import type {
  EnforcementResult,
  EnforcementAction,
  RequiredEvidence,
} from './enforcement.types.js';
import { getEvidenceRegistry } from '../evidence.registry.js';
import { getEvidencePolicyRegistry } from '../policies/policy-registry.js';
import { getEvidenceReviewRegistry } from '../domain/review-registry.js';
import { getHardGatePolicyRegistry } from '@dmf/shared';

export interface CheckProgressAllowedParams {
  userId: string;
  lessonId?: string;
  courseId?: string;
  attemptId?: string;
  action: EnforcementAction;
}

/**
 * Check if progress is allowed based on evidence
 */
export function checkProgressAllowed(
  params: CheckProgressAllowedParams
): EnforcementResult {
  const { userId, lessonId, courseId, action } = params;
  const policyRegistry = getEvidencePolicyRegistry();
  const evidenceRegistry = getEvidenceRegistry();
  const hardGateRegistry = getHardGatePolicyRegistry();
  
  // Check hard gate policy (priority: lesson > course > cohort > global)
  const hardGateEnabled = hardGateRegistry.isHardGateEnabled(lessonId, courseId, undefined);
  
  // Determine enforcement level: if hard gate policy enabled, use hard_gate; otherwise use registry level
  const baseEnforcementLevel = policyRegistry.getEnforcementLevel();
  const enforcementLevel = hardGateEnabled ? 'hard_gate' : baseEnforcementLevel;

  // Get policies for this action
  const policies = policyRegistry.getPoliciesByAction(action, lessonId ? 'lesson' : undefined);

  if (policies.length === 0) {
    // No policies for this action - allow by default
    return {
      allowed: true,
      level: enforcementLevel,
      reasons: [],
    };
  }

  // Use first matching policy (can be extended to support multiple policies)
  const policy = policies[0];

  // Get evidence summary
  const summary = evidenceRegistry.getEvidenceSummary(userId, lessonId);
  const reviewRegistry = getEvidenceReviewRegistry();

  // Check required evidence
  const missingEvidence: RequiredEvidence[] = [];
  const reasons: string[] = [];

  for (const required of policy.requiredEvidence) {
    const actualCount = summary.evidenceCounts[required.type] || 0;

    // Check if evidence needs review and if review is approved
    const needsReview = ['speaking', 'writing', 'teacher_validation'].includes(required.type);
    
    if (needsReview && actualCount > 0) {
      // Check if all evidence of this type have approved reviews
      const evidenceItems = lessonId
        ? evidenceRegistry.getEvidenceByLesson(userId, lessonId)
        : evidenceRegistry.getEvidenceByUser(userId);
      
      const typeEvidence = evidenceItems.filter((e) => e.type === required.type);
      const approvedCount = typeEvidence.filter((e) => {
        const review = reviewRegistry.getReviewByEvidenceId(e.evidenceId);
        return review && review.status === 'approved';
      }).length;

      if (approvedCount < required.minCount) {
        missingEvidence.push({
          type: required.type,
          minCount: required.minCount,
        });
        reasons.push(
          `Missing approved ${required.type}: required ${required.minCount}, found ${approvedCount} approved (${actualCount} total)`
        );
        continue;
      }
    }

    if (actualCount < required.minCount) {
      missingEvidence.push({
        type: required.type,
        minCount: required.minCount,
      });
      reasons.push(
        `Missing ${required.type}: required ${required.minCount}, found ${actualCount}`
      );
    }
  }

  // Determine if allowed based on enforcement level
  let allowed = true;

  if (missingEvidence.length > 0) {
    switch (enforcementLevel) {
      case 'observe':
        // Observe mode: always allow, just log
        allowed = true;
        reasons.push('(observe mode: violation logged but not blocked)');
        break;

      case 'soft_gate':
        // Soft gate: allow but warn
        allowed = true;
        reasons.push('(soft gate: violation warned but not blocked)');
        break;

      case 'hard_gate':
        // Hard gate: block progress
        allowed = false;
        break;
    }
  }

  return {
    allowed,
    level: enforcementLevel,
    reasons,
    missingEvidence: missingEvidence.length > 0 ? missingEvidence : undefined,
    policyId: policy.id,
  };
}
