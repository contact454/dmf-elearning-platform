/**
 * Learning Events Consumer (Người tiêu dùng Sự kiện Học tập)
 * 
 * Passive hooks: Listen to learning events and create evidence automatically.
 * NON-BLOCKING - does not modify existing handlers.
 */

import type { EventBus, Logger, AuditLogger } from '@dmf/infra';
import { getEvidenceRegistry } from '@dmf/evidence';
import type { Event } from '@dmf/infra';

// Generate evidence ID helper
function generateEvidenceId(): string {
  return `evd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Setup learning event consumers
 */
export function setupLearningEventConsumers(
  eventBus: EventBus,
  logger: Logger,
  auditLogger: AuditLogger
): void {
  // learning.lesson.started -> attendance evidence
  eventBus.subscribe('learning.lesson.started', async (event: Event) => {
    try {
      const payload = event.payload as any;
      const registry = getEvidenceRegistry();

      const evidenceId = generateEvidenceId();
      registry.addEvidence({
        evidenceId,
        type: 'attendance',
        userId: payload.userId,
        lessonId: payload.lessonId,
        courseId: payload.courseId,
        attemptId: payload.attemptId,
        source: 'system',
        referenceIds: [payload.attemptId || ''],
        createdAt: new Date().toISOString(),
      });

      // Emit evidence.created event
      await eventBus.emit({
        eventName: 'evidence.created',
        payload: {
          eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          occurredAt: new Date().toISOString(),
          evidenceId,
          type: 'attendance',
          userId: payload.userId,
          lessonId: payload.lessonId,
          courseId: payload.courseId,
          attemptId: payload.attemptId,
          source: 'system',
        },
      });

      // Audit log
      auditLogger.logCommandReceived('evidence.create', payload.userId, evidenceId);

      logger.info('Evidence created from lesson.started', {
        evidenceId,
        userId: payload.userId,
        lessonId: payload.lessonId,
      });
    } catch (error: any) {
      logger.error('Failed to create evidence from lesson.started', error);
    }
  });

  // learning.submission.created -> activity_submission evidence
  eventBus.subscribe('learning.submission.created', async (event: Event) => {
    try {
      const payload = event.payload as any;
      const registry = getEvidenceRegistry();

      const evidenceId = generateEvidenceId();
      registry.addEvidence({
        evidenceId,
        type: 'activity_submission',
        userId: payload.userId,
        lessonId: payload.lessonId,
        attemptId: payload.attemptId,
        source: 'system',
        referenceIds: [payload.submissionId || ''],
        createdAt: new Date().toISOString(),
      });

      // Emit evidence.created event
      await eventBus.emit({
        eventName: 'evidence.created',
        payload: {
          eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          occurredAt: new Date().toISOString(),
          evidenceId,
          type: 'activity_submission',
          userId: payload.userId,
          lessonId: payload.lessonId,
          attemptId: payload.attemptId,
          source: 'system',
        },
      });

      // Audit log
      auditLogger.logCommandReceived('evidence.create', payload.userId, evidenceId);

      logger.info('Evidence created from submission.created', {
        evidenceId,
        userId: payload.userId,
        submissionId: payload.submissionId,
      });
    } catch (error: any) {
      logger.error('Failed to create evidence from submission.created', error);
    }
  });

  // learning.lesson.completed -> attendance + completion marker
  eventBus.subscribe('learning.lesson.completed', async (event: Event) => {
    try {
      const payload = event.payload as any;
      const registry = getEvidenceRegistry();

      // Create completion evidence (attendance marker)
      const evidenceId = generateEvidenceId();
      registry.addEvidence({
        evidenceId,
        type: 'attendance',
        userId: payload.userId,
        lessonId: payload.lessonId,
        courseId: payload.courseId,
        attemptId: payload.attemptId,
        source: 'system',
        referenceIds: [payload.attemptId || ''],
        createdAt: new Date().toISOString(),
      });

      // Emit evidence.created event
      await eventBus.emit({
        eventName: 'evidence.created',
        payload: {
          eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          occurredAt: new Date().toISOString(),
          evidenceId,
          type: 'attendance',
          userId: payload.userId,
          lessonId: payload.lessonId,
          courseId: payload.courseId,
          attemptId: payload.attemptId,
          source: 'system',
        },
      });

      // Audit log
      auditLogger.logCommandReceived('evidence.create', payload.userId, evidenceId);

      logger.info('Evidence created from lesson.completed', {
        evidenceId,
        userId: payload.userId,
        lessonId: payload.lessonId,
      });
    } catch (error: any) {
      logger.error('Failed to create evidence from lesson.completed', error);
    }
  });
}
