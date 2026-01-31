/**
 * Ops Snapshot Builder (Xây dựng Snapshot Vận hành)
 * 
 * Builds ops snapshot from various data sources.
 */

import type { OpsSnapshot } from './ops-snapshot.js';
import { getEvidenceReviewRegistry, getHardGatePolicyRegistry } from '@dmf/shared';

/**
 * Build ops snapshot for time range
 */
export function buildOpsSnapshot(from: string, to: string): OpsSnapshot {
  const reviewRegistry = getEvidenceReviewRegistry();
  const hardGateRegistry = getHardGatePolicyRegistry();

  // Get reviews by status
  const pendingReviews = reviewRegistry.getReviewQueue({ status: 'pending' });
  const approvedReviews = reviewRegistry.getReviewQueue({ status: 'approved' });
  const rejectedReviews = reviewRegistry.getReviewQueue({ status: 'rejected' });
  const expiredReviews = reviewRegistry.getReviewQueue({ status: 'expired' });

  // Calculate review queue stats
  const reviewQueue = calculateReviewQueueStats(
    pendingReviews,
    approvedReviews,
    rejectedReviews,
    expiredReviews,
    from,
    to
  );

  // Get hard gate policy state
  const hardGateScopes = hardGateRegistry.getAllPolicies();
  const globalPolicy = hardGateRegistry.getPolicy('global', undefined);
  const hardGateEnabled = globalPolicy?.enabled || false;

  // Build snapshot
  return {
    timeRange: { from, to },
    reviewQueue,
    progressHealth: {
      learnersActiveTotal: 0, // TODO: Get from progress service
      blockedByHardGateTotal: 0, // TODO: Get from enforcement metrics
      blockedByPendingReviewTotal: 0, // TODO: Get from enforcement metrics
      completionRate: 0, // TODO: Calculate from progress data
    },
    reliability: {
      http5xxTotal: 0, // TODO: Get from metrics
      transientFailuresTotal: 0, // TODO: Get from metrics
      outboxBacklogTotal: 0, // TODO: Get from outbox
      idempotencyCollisionsTotal: 0, // TODO: Get from idempotency store
    },
    policy: {
      hardGateEnabled,
      hardGateScopes: hardGateScopes.map((p) => ({
        scope: p.scope,
        scopeId: p.scopeId,
        enabled: p.enabled,
        updatedAt: p.updatedAt,
        updatedBy: p.updatedBy,
      })),
    },
  };
}

/**
 * Calculate review queue statistics
 */
function calculateReviewQueueStats(
  pending: Array<{ reviewerRole?: string; courseId?: string; submittedAt?: string; createdAt?: string; expiresAt?: string }>,
  approved: Array<{ reviewerRole?: string; courseId?: string; submittedAt?: string; createdAt?: string }>,
  rejected: Array<{ reviewerRole?: string; courseId?: string; submittedAt?: string; createdAt?: string }>,
  expired: Array<{ reviewerRole?: string; courseId?: string; expiresAt?: string; submittedAt?: string; createdAt?: string }>,
  from: string,
  to: string
) {
  const now = new Date();
  const fromDate = new Date(from);
  const toDate = new Date(to);

  // Calculate SLA breaches (expired reviews in time range)
  const slaBreaches = expired.filter((r) => {
    if (!r.expiresAt) return false;
    const expiredAt = new Date(r.expiresAt);
    return expiredAt >= fromDate && expiredAt <= toDate;
  });

  // Group by role
  const byRole: Record<string, { pending: any[]; slaBreaches: any[] }> = {};
  for (const review of pending) {
    const role = review.reviewerRole || 'teacher';
    if (!byRole[role]) {
      byRole[role] = { pending: [], slaBreaches: [] };
    }
    byRole[role].pending.push(review);
  }
  for (const breach of slaBreaches) {
    const role = breach.reviewerRole || 'teacher';
    if (!byRole[role]) {
      byRole[role] = { pending: [], slaBreaches: [] };
    }
    byRole[role].slaBreaches.push(breach);
  }

  // Calculate age statistics
  const roleStats = Object.entries(byRole).map(([role, data]) => {
    const ages = data.pending.map((r) => {
      const createdAt = new Date(r.submittedAt || r.createdAt);
      return (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60); // hours
    });
    const sortedAges = ages.sort((a, b) => a - b);
    const avgAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;
    const p95Age = sortedAges.length > 0 ? sortedAges[Math.floor(sortedAges.length * 0.95)] : 0;

    return {
      reviewerRole: role as 'teacher' | 'mentor',
      pending: data.pending.length,
      slaBreaches: data.slaBreaches.length,
      avgAgeHours: avgAge,
      p95AgeHours: p95Age,
    };
  });

  // Group by course
  const byCourse: Record<string, { pending: any[]; slaBreaches: any[] }> = {};
  for (const review of pending) {
    const courseId = review.courseId || 'unknown';
    if (!byCourse[courseId]) {
      byCourse[courseId] = { pending: [], slaBreaches: [] };
    }
    byCourse[courseId].pending.push(review);
  }
  for (const breach of slaBreaches) {
    const courseId = breach.courseId || 'unknown';
    if (!byCourse[courseId]) {
      byCourse[courseId] = { pending: [], slaBreaches: [] };
    }
    byCourse[courseId].slaBreaches.push(breach);
  }

  const courseStats = Object.entries(byCourse).map(([courseId, data]) => ({
    courseId,
    pending: data.pending.length,
    slaBreaches: data.slaBreaches.length,
  }));

  return {
    pendingTotal: pending.length,
    approvedTotal: approved.length,
    rejectedTotal: rejected.length,
    expiredTotal: expired.length,
    slaBreachesTotal: slaBreaches.length,
    byRole: roleStats,
    byCourse: courseStats,
  };
}
