/**
 * Replay Strategy: What events can/cannot be replayed safely
 * 
 * Phase 2 Track A: Persistence & Replay Safety
 * 
 * Defines which events are safe to replay and under what conditions.
 * This is critical for:
 * - Rebuilding read models from events
 * - Recovering from failures
 * - Debugging production issues
 * 
 * Rule: If an event has side effects that cannot be idempotently replayed,
 * it should be marked as non-replayable.
 */

/**
 * Replayability classification for an event
 */
export type ReplayStrategy = {
  /**
   * Event name (e.g., 'learning.lesson.completed', 'ops.degrade.activated')
   */
  eventName: string;

  /**
   * Whether this event can be safely replayed
   * 
   * Replayable events:
   * - Have no external side effects (e.g., sending emails, charging credit cards)
   * - Are idempotent (replaying produces the same result)
   * - Only update internal state (e.g., read models, progress tracking)
   * 
   * Non-replayable events:
   * - Have external side effects (e.g., notifications, payments)
   * - Are time-sensitive (e.g., ops.degrade.activated - current system state matters)
   * - Are one-time actions (e.g., user registration confirmation email)
   */
  replayable: boolean;

  /**
   * Reason why this event is replayable or not
   * 
   * Examples:
   * - "Updates internal read model only, no external side effects"
   * - "Sends external notification, cannot be replayed"
   * - "Time-sensitive ops decision, depends on current system state"
   */
  reason?: string;

  /**
   * Whether a snapshot is required before replaying this event
   * 
   * Some events require a snapshot of the current state before replay
   * to ensure consistency (e.g., ops decisions that depend on current load)
   */
  requiresSnapshot?: boolean;

  /**
   * Whether this event can be replayed in isolation
   * 
   * Some events must be replayed in order (e.g., lesson.completed after lesson.started)
   * Others can be replayed independently
   */
  requiresOrder?: boolean;
};

/**
 * Default replay strategies for common event patterns
 * 
 * This is a starting point. Services should override with service-specific strategies.
 */
export const DEFAULT_REPLAY_STRATEGIES: ReplayStrategy[] = [
  // Learning events: Generally replayable (update internal state only)
  {
    eventName: 'learning.lesson.started',
    replayable: true,
    reason: 'Updates internal progress state only, no external side effects',
    requiresOrder: true,
  },
  {
    eventName: 'learning.lesson.completed',
    replayable: true,
    reason: 'Updates internal progress state only, no external side effects',
    requiresOrder: true,
  },
  {
    eventName: 'learning.lesson.abandoned',
    replayable: true,
    reason: 'Updates internal progress state only, no external side effects',
    requiresOrder: true,
  },

  // Assessment events: Replayable (internal scoring only)
  {
    eventName: 'assessment.quiz.started',
    replayable: true,
    reason: 'Updates internal assessment state only',
    requiresOrder: true,
  },
  {
    eventName: 'assessment.quiz.submitted',
    replayable: true,
    reason: 'Updates internal assessment state only',
    requiresOrder: true,
  },

  // Evidence events: Replayable (internal evidence tracking)
  {
    eventName: 'evidence.created',
    replayable: true,
    reason: 'Updates internal evidence registry only',
  },
  {
    eventName: 'evidence.review.approved',
    replayable: true,
    reason: 'Updates internal evidence status only',
    requiresOrder: true, // Must replay after evidence.created
  },

  // Ops events: Context-dependent (may not be replayable)
  {
    eventName: 'ops.overload.detected',
    replayable: false,
    reason: 'Time-sensitive detection, depends on current system state',
    requiresSnapshot: true,
  },
  {
    eventName: 'ops.degrade.activated',
    replayable: false,
    reason: 'Time-sensitive decision, depends on current system state',
    requiresSnapshot: true,
  },
  {
    eventName: 'policy.hard_gate.updated',
    replayable: true,
    reason: 'Policy update is idempotent, can be replayed',
  },

  // System events: Generally replayable
  {
    eventName: 'system.user.registered',
    replayable: true,
    reason: 'Updates internal user registry only',
  },
];

/**
 * Get replay strategy for an event
 */
export function getReplayStrategy(eventName: string): ReplayStrategy | undefined {
  return DEFAULT_REPLAY_STRATEGIES.find((s) => s.eventName === eventName);
}

/**
 * Check if an event is replayable
 */
export function isReplayable(eventName: string): boolean {
  const strategy = getReplayStrategy(eventName);
  return strategy?.replayable ?? false; // Default to non-replayable if unknown
}

/**
 * Check if an event requires a snapshot before replay
 */
export function requiresSnapshot(eventName: string): boolean {
  const strategy = getReplayStrategy(eventName);
  return strategy?.requiresSnapshot ?? false;
}