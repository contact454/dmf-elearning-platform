/**
 * Learning Enforcement Hooks (Móc Enforcement Học tập)
 * 
 * Safe hooks that check evidence before allowing learning progress.
 * NON-BLOCKING by default (soft_gate), can be toggled to hard_gate.
 */

import type { EventBus, Logger, AuditLogger } from '@dmf/infra';
import { checkProgressAllowed } from '@dmf/evidence';
import type { Event } from '@dmf/infra';

// Generate event ID helper
function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Setup learning enforcement hooks
 */
export function setupLearningEnforcementHooks(
  eventBus: EventBus,
  logger: Logger,
  auditLogger: AuditLogger
): void {
  // Hook: learning.lesson.completed -> check evidence before allowing completion
  eventBus.subscribe('learning.lesson.completed', async (event: Event) => {
    try {
      const payload = event.payload as any;
      const userId = payload.userId;
      const lessonId = payload.lessonId;
      const courseId = payload.courseId;
      const attemptId = payload.attemptId;

      // Check if progress is allowed
      const result = checkProgressAllowed({
        userId,
        lessonId,
        courseId,
        attemptId,
        action: 'complete',
      });

      // Handle based on enforcement level
      if (result.missingEvidence && result.missingEvidence.length > 0) {
        // Emit policy violation detected event
        await eventBus.emit({
          eventName: 'evidence.policy_violation_detected',
          payload: {
            eventId: generateEventId(),
            occurredAt: new Date().toISOString(),
            userId,
            lessonId,
            courseId,
            action: 'complete',
            policyId: result.policyId || '',
            missingEvidence: result.missingEvidence,
            enforcementLevel: result.level,
          },
        });

        if (result.level === 'soft_gate') {
          // Soft gate: emit warning event but allow
          await eventBus.emit({
            eventName: 'evidence.soft_gate_triggered',
            payload: {
              eventId: generateEventId(),
              occurredAt: new Date().toISOString(),
              userId,
              lessonId,
              courseId,
              action: 'complete',
              policyId: result.policyId || '',
              missingEvidence: result.missingEvidence,
            },
          });

          const reasonsText = Array.isArray(result.reasons) ? result.reasons.join(', ') : String(result.reasons || '');
          const missingEvidenceText = result.missingEvidence ? JSON.stringify(result.missingEvidence) : '';

          logger.warn('Evidence soft gate triggered', {
            userId,
            lessonId,
            reasons: reasonsText,
            missingEvidence: missingEvidenceText,
          });

          // Audit log
          auditLogger.logCommandReceived('evidence.soft_gate', userId, lessonId || '');
        } else if (result.level === 'hard_gate' && !result.allowed) {
          // Hard gate: emit blocked event
          await eventBus.emit({
            eventName: 'evidence.hard_gate_blocked',
            payload: {
              eventId: generateEventId(),
              occurredAt: new Date().toISOString(),
              userId,
              lessonId,
              courseId,
              action: 'complete',
              policyId: result.policyId || '',
              missingEvidence: result.missingEvidence,
            },
          });

          const reasonsText = Array.isArray(result.reasons) ? result.reasons.join(', ') : String(result.reasons || '');
          const missingEvidenceText = result.missingEvidence ? JSON.stringify(result.missingEvidence) : '';

          logger.error('Evidence hard gate blocked', undefined, {
            userId,
            lessonId,
            reasons: reasonsText,
            missingEvidence: missingEvidenceText,
          });

          // Audit log
          auditLogger.logCommandReceived('evidence.hard_gate', userId, lessonId || '');
        }
      }
    } catch (error: any) {
      logger.error('Enforcement hook failed', error);
    }
  });
}
