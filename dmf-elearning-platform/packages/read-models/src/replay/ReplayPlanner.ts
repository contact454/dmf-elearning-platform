/**
 * Replay Planner: How to plan a safe event replay
 * 
 * Phase 2 Track A: Persistence & Replay Safety
 * 
 * Plans a safe replay strategy for rebuilding read models from events.
 * 
 * Key concerns:
 * - Only replay replayable events
 * - Respect event ordering
 * - Create snapshots at boundaries
 * - Handle non-replayable events gracefully
 */

import { isReplayable, requiresSnapshot } from './ReplayStrategy.js';
import { shouldSnapshotAfter, shouldSnapshotBefore } from './SnapshotBoundary.js';

/**
 * Event to be replayed
 */
export type ReplayEvent = {
  eventId: string;
  eventName: string;
  occurredAt: string;
  payload: unknown;
  correlationId?: string;
};

/**
 * Replay plan
 */
export type ReplayPlan = {
  /**
   * Events that will be replayed (in order)
   */
  replayableEvents: ReplayEvent[];

  /**
   * Events that will be skipped (non-replayable)
   */
  skippedEvents: Array<{
    event: ReplayEvent;
    reason: string;
  }>;

  /**
   * Snapshot points (before/after events)
   */
  snapshotPoints: Array<{
    eventId: string;
    eventName: string;
    position: 'before' | 'after';
    readModelTypes?: string[];
  }>;

  /**
   * Warnings about the replay plan
   */
  warnings: string[];

  /**
   * Total events processed
   */
  totalEvents: number;
};

/**
 * Plan a safe replay from a list of events
 * 
 * @param events Events to replay (should be ordered by occurredAt)
 * @param fromEventId Start replay from this event (optional, for incremental replay)
 * @param toEventId End replay at this event (optional)
 */
export function planReplay(
  events: ReplayEvent[],
  options?: {
    fromEventId?: string;
    toEventId?: string;
    readModelTypes?: string[];
  }
): ReplayPlan {
  const { fromEventId, toEventId, readModelTypes } = options || {};

  const replayableEvents: ReplayEvent[] = [];
  const skippedEvents: Array<{ event: ReplayEvent; reason: string }> = [];
  const snapshotPoints: Array<{
    eventId: string;
    eventName: string;
    position: 'before' | 'after';
    readModelTypes?: string[];
  }> = [];
  const warnings: string[] = [];

  let started = !fromEventId;
  let ended = false;

  for (const event of events) {
    // Check start boundary
    if (fromEventId && event.eventId === fromEventId) {
      started = true;
    }
    if (!started) {
      continue;
    }

    // Check end boundary
    if (toEventId && event.eventId === toEventId) {
      ended = true;
    }
    if (ended) {
      break;
    }

    // Check if event is replayable
    if (!isReplayable(event.eventName)) {
      skippedEvents.push({
        event,
        reason: `Event ${event.eventName} is not replayable (may have external side effects or be time-sensitive)`,
      });
      continue;
    }

    // Check if snapshot is required before this event
    if (requiresSnapshot(event.eventName) || shouldSnapshotBefore(event.eventName)) {
      snapshotPoints.push({
        eventId: event.eventId,
        eventName: event.eventName,
        position: 'before',
        readModelTypes,
      });
    }

    // Add to replayable events
    replayableEvents.push(event);

    // Check if snapshot is required after this event
    if (shouldSnapshotAfter(event.eventName)) {
      snapshotPoints.push({
        eventId: event.eventId,
        eventName: event.eventName,
        position: 'after',
        readModelTypes,
      });
    }
  }

  // Warnings
  if (skippedEvents.length > 0) {
    warnings.push(
      `${skippedEvents.length} events will be skipped (non-replayable). Read models may be incomplete.`
    );
  }

  if (snapshotPoints.length === 0 && replayableEvents.length > 100) {
    warnings.push(
      'Large replay without snapshots. Consider adding snapshot boundaries for performance.'
    );
  }

  return {
    replayableEvents,
    skippedEvents,
    snapshotPoints,
    warnings,
    totalEvents: events.length,
  };
}

/**
 * Validate a replay plan
 * 
 * Returns warnings and errors about the plan
 */
export function validateReplayPlan(plan: ReplayPlan): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [...plan.warnings];

  // Check for ordering issues
  const eventNames = plan.replayableEvents.map((e) => e.eventName);
  if (eventNames.includes('learning.lesson.completed') && !eventNames.includes('learning.lesson.started')) {
    warnings.push(
      'lesson.completed found without lesson.started. May indicate missing events or ordering issue.'
    );
  }

  // Check for large replays without snapshots
  if (plan.replayableEvents.length > 1000 && plan.snapshotPoints.length === 0) {
    warnings.push(
      'Large replay (>1000 events) without snapshots. Replay may be slow. Consider adding snapshot boundaries.'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}