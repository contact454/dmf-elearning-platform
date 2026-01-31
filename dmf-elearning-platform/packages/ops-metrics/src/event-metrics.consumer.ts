/**
 * Event Metrics Consumer
 * 
 * Consumes domain events and increments metrics counters.
 * Read-only projection - no side effects on domain logic.
 */

import type { EventBus, Logger } from '@dmf/infra';
import { getMetricsRegistry } from './metrics-registry.js';

/**
 * Event name to metric name mapping
 */
const EVENT_TO_METRIC: Record<string, string> = {
  'learning.lesson.started': 'lessons_started_total',
  'learning.lesson.completed': 'lessons_completed_total',
  'learning.lesson.abandoned': 'lessons_abandoned_total',
  'learning.submission.created': 'submissions_created_total',
  'assessment.quiz.started': 'quizzes_started_total',
  'assessment.quiz.submitted': 'quizzes_submitted_total',
  'system.user.registered': 'users_registered_total',
  'curriculum.course.enrolled': 'course_enrollments_total',
  // Ops events
  'ops.policy.created': 'ops_policy_created_total',
  'ops.policy.activated': 'ops_policy_activated_total',
  'ops.resource.rolled_back': 'ops_rollback_total',
  'ops.rbac.diff.viewed': 'ops_rbac_diff_requests_total',
  // Evidence events
  'evidence.created': 'evidence_created_total',
  'evidence.validated': 'evidence_validation_total',
  'evidence.revoked': 'evidence_revoked_total',
  'evidence.soft_gate_triggered': 'evidence_soft_gate_total',
  'evidence.hard_gate_blocked': 'evidence_hard_gate_total',
  'evidence.policy_violation_detected': 'evidence_policy_violation_total',
  'evidence.review.approved': 'evidence_review_approved_total',
  'evidence.review.rejected': 'evidence_review_rejected_total',
  'evidence.review.expired': 'evidence_review_expired_total',
  'evidence.review.escalated': 'evidence_review_escalated_total',
  // Ops events
  'policy.hard_gate.updated': 'policy_hard_gate_updated_total',
  'ops.overload.detected': 'ops_overload_detected_total',
  'ops.degrade.activated': 'ops_degrade_activated_total',
  'ops.degrade.deactivated': 'ops_degrade_deactivated_total',
};

/**
 * Setup event metrics consumers
 */
export function setupEventMetricsConsumers(eventBus: EventBus, serviceName: string, logger: Logger): void {
  const registry = getMetricsRegistry();

  // Subscribe to all events and increment counters
  for (const [eventName, metricName] of Object.entries(EVENT_TO_METRIC)) {
    eventBus.subscribe(eventName as any, async (_event) => {
      try {
        registry.incrementCounter('events_consumed_total', {
          service: serviceName,
          eventName,
        });

        // Also increment domain-specific metric
        registry.incrementCounter(metricName, {
          service: serviceName,
        });

        logger.debug('Event metric recorded', {
          eventName,
          metricName,
          service: serviceName,
        });
      } catch (error) {
        logger.error('Failed to record event metric', error as Error, {
          eventName,
          service: serviceName,
        });
      }
    });
  }

  // Also track all events published (via outbox or direct publish)
  // This is a best-effort tracking - actual publish tracking should be in event bus adapter
  logger.info('Event metrics consumers registered', {
    service: serviceName,
    eventCount: Object.keys(EVENT_TO_METRIC).length,
  });
}
