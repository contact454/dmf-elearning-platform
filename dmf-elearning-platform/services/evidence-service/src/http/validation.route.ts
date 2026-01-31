/**
 * Validation Routes (Teacher/Mentor Manual Evidence)
 * 
 * POST /api/evidence/teacher/validate
 * POST /api/evidence/mentor/validate
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { Logger, EventBus, AuditLogger } from '@dmf/infra';
import { getEvidenceRegistry } from '@dmf/evidence';

// Generate evidence ID helper
function generateEvidenceId(): string {
  return `evd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function registerValidationRoutes(
  app: FastifyInstance,
  deps: { logger: Logger; eventBus: EventBus; auditLogger: AuditLogger }
) {
  // Teacher validation
  app.post('/api/evidence/teacher/validate', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const actorUserId = (request as any).requestContext?.userId || 'teacher-system';

    try {
      if (!body.userId || !body.lessonId) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            category: 'ClientError',
            message: 'userId and lessonId are required',
          },
        });
      }

      const registry = getEvidenceRegistry();
      const evidenceId = generateEvidenceId();

      registry.addEvidence({
        evidenceId,
        type: 'teacher_validation',
        userId: body.userId,
        lessonId: body.lessonId,
        courseId: body.courseId,
        attemptId: body.attemptId,
        source: 'teacher',
        referenceIds: body.referenceIds || [],
        createdAt: new Date().toISOString(),
      });

      // Emit evidence.created event
      await deps.eventBus.emit({
        eventName: 'evidence.created',
        payload: {
          eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          occurredAt: new Date().toISOString(),
          evidenceId,
          type: 'teacher_validation',
          userId: body.userId,
          lessonId: body.lessonId,
          courseId: body.courseId,
          attemptId: body.attemptId,
          source: 'teacher',
        },
      });

      // Audit log
      deps.auditLogger.logCommandReceived('evidence.teacher.validate', actorUserId, evidenceId);

      return reply.code(201).send({
        evidence: {
          evidenceId,
          type: 'teacher_validation',
          userId: body.userId,
          lessonId: body.lessonId,
        },
      });
    } catch (error: any) {
      deps.logger.error('Teacher validation failed', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: error.message || 'Internal server error',
        },
      });
    }
  });

  // Mentor validation
  app.post('/api/evidence/mentor/validate', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const actorUserId = (request as any).requestContext?.userId || 'mentor-system';

    try {
      if (!body.userId || !body.lessonId) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            category: 'ClientError',
            message: 'userId and lessonId are required',
          },
        });
      }

      const registry = getEvidenceRegistry();
      const evidenceId = generateEvidenceId();

      registry.addEvidence({
        evidenceId,
        type: 'mentor_validation',
        userId: body.userId,
        lessonId: body.lessonId,
        courseId: body.courseId,
        attemptId: body.attemptId,
        source: 'mentor',
        referenceIds: body.referenceIds || [],
        createdAt: new Date().toISOString(),
      });

      // Emit evidence.created event
      await deps.eventBus.emit({
        eventName: 'evidence.created',
        payload: {
          eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          occurredAt: new Date().toISOString(),
          evidenceId,
          type: 'mentor_validation',
          userId: body.userId,
          lessonId: body.lessonId,
          courseId: body.courseId,
          attemptId: body.attemptId,
          source: 'mentor',
        },
      });

      // Audit log
      deps.auditLogger.logCommandReceived('evidence.mentor.validate', actorUserId, evidenceId);

      return reply.code(201).send({
        evidence: {
          evidenceId,
          type: 'mentor_validation',
          userId: body.userId,
          lessonId: body.lessonId,
        },
      });
    } catch (error: any) {
      deps.logger.error('Mentor validation failed', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: error.message || 'Internal server error',
        },
      });
    }
  });
}
