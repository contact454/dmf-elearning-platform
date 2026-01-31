/**
 * Overload Detector (Phát hiện Quá tải)
 * 
 * Detects human load overload based on review queue metrics.
 */

import type { ReviewQueueStats } from '../readmodels/ops-snapshot.js';

/**
 * Overload thresholds
 */
export const PENDING_REVIEW_LIMIT_TEACHER = 50;
export const PENDING_REVIEW_LIMIT_MENTOR = 80;
export const SLA_BREACH_RATE_LIMIT = 0.15; // 15%

export interface OverloadStatus {
  overloaded: boolean;
  reasons: string[];
  roleOverloads: Array<{
    role: 'teacher' | 'mentor';
    overloaded: boolean;
    pending: number;
    limit: number;
    breachRate: number;
  }>;
}

/**
 * Detect overload from review queue stats
 */
export function detectOverload(stats: ReviewQueueStats): OverloadStatus {
  const reasons: string[] = [];
  const roleOverloads: Array<{
    role: 'teacher' | 'mentor';
    overloaded: boolean;
    pending: number;
    limit: number;
    breachRate: number;
  }> = [];

  // Check each role
  for (const roleStat of stats.byRole) {
    const limit =
      roleStat.reviewerRole === 'teacher'
        ? PENDING_REVIEW_LIMIT_TEACHER
        : PENDING_REVIEW_LIMIT_MENTOR;

    const overloaded = roleStat.pending > limit;

    // Calculate breach rate
    const total = stats.pendingTotal + stats.approvedTotal + stats.rejectedTotal + stats.expiredTotal;
    const breachRate = total > 0 ? stats.slaBreachesTotal / total : 0;
    const breachRateOverloaded = breachRate > SLA_BREACH_RATE_LIMIT;

    roleOverloads.push({
      role: roleStat.reviewerRole,
      overloaded: overloaded || breachRateOverloaded,
      pending: roleStat.pending,
      limit,
      breachRate,
    });

    if (overloaded) {
      reasons.push(
        `${roleStat.reviewerRole} overloaded: ${roleStat.pending} pending (limit: ${limit})`
      );
    }

    if (breachRateOverloaded) {
      reasons.push(
        `${roleStat.reviewerRole} SLA breach rate: ${(breachRate * 100).toFixed(1)}% (limit: ${(SLA_BREACH_RATE_LIMIT * 100).toFixed(1)}%)`
      );
    }
  }

  const overallOverloaded = roleOverloads.some((r) => r.overloaded);

  return {
    overloaded: overallOverloaded,
    reasons,
    roleOverloads,
  };
}
