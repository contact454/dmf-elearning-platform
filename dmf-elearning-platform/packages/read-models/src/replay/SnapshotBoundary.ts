/**
 * Snapshot Boundary: When to create snapshots for read models
 * 
 * Phase 2 Track A: Persistence & Replay Safety
 * 
 * Defines when snapshots should be created to enable efficient read model rebuilds.
 * 
 * Strategy:
 * - Snapshot after critical events (e.g., lesson completion, enrollment)
 * - Snapshot at regular intervals (e.g., every N events, or every hour)
 * - Snapshot before non-replayable events (to preserve state)
 */

/**
 * Snapshot boundary definition
 */
export type SnapshotBoundary = {
  /**
   * Event name that triggers snapshot
   */
  eventName: string;

  /**
   * Whether to snapshot AFTER this event
   * 
   * Use case: After a critical milestone (e.g., lesson.completed, enrollment.created)
   */
  snapshotAfter: boolean;

  /**
   * Whether to snapshot BEFORE this event
   * 
   * Use case: Before a non-replayable event (to preserve state before ops decision)
   */
  snapshotBefore?: boolean;

  /**
   * Read model types that should be snapshotted
   * 
   * If empty, snapshot all read models
   */
  readModelTypes?: string[];

  /**
   * Reason for this snapshot boundary
   */
  reason?: string;
};

/**
 * Snapshot boundary rules
 * 
 * These define when snapshots are created for efficient replay.
 */
export const SNAPSHOT_BOUNDARIES: SnapshotBoundary[] = [
  // Learning milestones: Snapshot after completion
  {
    eventName: 'learning.lesson.completed',
    snapshotAfter: true,
    readModelTypes: ['lesson-progress', 'user-dashboard'],
    reason: 'Lesson completion is a critical milestone for progress tracking',
  },
  {
    eventName: 'curriculum.course.enrolled',
    snapshotAfter: true,
    readModelTypes: ['user-dashboard'],
    reason: 'Enrollment is a critical milestone for user state',
  },

  // Ops events: Snapshot before (to preserve state before decision)
  {
    eventName: 'ops.degrade.activated',
    snapshotAfter: false,
    snapshotBefore: true,
    readModelTypes: ['ops-snapshot'],
    reason: 'Preserve system state before ops decision',
  },
  {
    eventName: 'ops.overload.detected',
    snapshotAfter: false,
    snapshotBefore: true,
    readModelTypes: ['ops-snapshot'],
    reason: 'Preserve system state before overload detection',
  },

  // Evidence validation: Snapshot after approval
  {
    eventName: 'evidence.review.approved',
    snapshotAfter: true,
    readModelTypes: ['evidence-summary'],
    reason: 'Evidence approval affects progress eligibility',
  },
];

/**
 * Get snapshot boundaries for an event
 */
export function getSnapshotBoundaries(eventName: string): SnapshotBoundary[] {
  return SNAPSHOT_BOUNDARIES.filter((b) => b.eventName === eventName);
}

/**
 * Check if we should snapshot after an event
 */
export function shouldSnapshotAfter(eventName: string): boolean {
  return SNAPSHOT_BOUNDARIES.some((b) => b.eventName === eventName && b.snapshotAfter);
}

/**
 * Check if we should snapshot before an event
 */
export function shouldSnapshotBefore(eventName: string): boolean {
  return SNAPSHOT_BOUNDARIES.some((b) => b.eventName === eventName && b.snapshotBefore);
}