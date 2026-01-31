/**
 * Ops Snapshot Read Model (Read Model Snapshot Vận hành)
 * 
 * Aggregated view of system health, review queue, progress, reliability.
 */

export interface ReviewQueueStats {
  pendingTotal: number;
  approvedTotal: number;
  rejectedTotal: number;
  expiredTotal: number;
  slaBreachesTotal: number;

  byRole: Array<{
    reviewerRole: 'teacher' | 'mentor';
    pending: number;
    slaBreaches: number;
    avgAgeHours: number;
    p95AgeHours: number;
  }>;

  byCourse: Array<{
    courseId: string;
    pending: number;
    slaBreaches: number;
  }>;
}

export interface ProgressHealth {
  learnersActiveTotal: number;
  blockedByHardGateTotal: number;
  blockedByPendingReviewTotal: number;
  completionRate: number; // in timeRange
}

export interface Reliability {
  http5xxTotal: number;
  transientFailuresTotal: number;
  outboxBacklogTotal: number;
  idempotencyCollisionsTotal: number;
}

export interface HardGateScopeState {
  scope: 'global' | 'course' | 'lesson' | 'cohort';
  scopeId?: string;
  enabled: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface PolicyState {
  hardGateEnabled: boolean;
  hardGateScopes: HardGateScopeState[];
}

export interface OpsSnapshot {
  timeRange: {
    from: string; // ISO 8601
    to: string; // ISO 8601
  };

  reviewQueue: ReviewQueueStats;
  progressHealth: ProgressHealth;
  reliability: Reliability;
  policy: PolicyState;
}
