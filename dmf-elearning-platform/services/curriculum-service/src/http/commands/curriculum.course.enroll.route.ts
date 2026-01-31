/**
 * HTTP route: POST /api/curriculum/course/enroll (Tuyến HTTP: Ghi danh khóa học)
 */

import type { FastifyInstance } from 'fastify';
import { commandRegistry } from '@dmf/contracts';
import { handleCurriculumCourseEnroll } from '../../application/curriculum.course.enroll.handler';
import { EnrollmentRepository } from '../../state/enrollment.repository';
import type { EventBus, Logger, AuditLogger, Database, IdempotencyStore, Outbox } from '@dmf/infra';
import { makeValidationError, getHttpStatusCode, StandardError } from '@dmf/shared';

export function registerCurriculumCourseEnrollRoute(
  app: FastifyInstance,
  deps: {
    eventBus: EventBus;
    database: Database;
    logger: Logger;
    auditLogger: AuditLogger;
    idempotencyStore: IdempotencyStore;
    outbox: Outbox;
  }
) {
  app.post('/api/curriculum/course/enroll', async (request, reply) => {
    const requestId = `req-${Date.now()}`;
    const role = (request as any).user?.role || 'learner';

    try {
      const schema = commandRegistry['curriculum.course.enroll'];
      const command = schema.parse(request.body);

      // Extract userId from auth token, fallback to command.userId for dev/E2E
      // TODO: In production, always require auth token
      const userId = (request as any).user?.userId || command.userId;

      const enrollmentRepository = new EnrollmentRepository(deps.database);
      const result = await handleCurriculumCourseEnroll(
        command,
        { userId, role },
        { enrollmentRepository, eventBus: deps.eventBus, idempotencyStore: deps.idempotencyStore, outbox: deps.outbox }
      );

      deps.auditLogger.logCommandReceived('curriculum.course.enroll', userId, requestId, command.correlationId);

      // Check if idempotent replay (Kiểm tra phát lại idempotent)
      if ((result as any).replayed) {
        return reply.code(201).send({
          ...result,
          replayed: true,
        });
      }

      return reply.code(201).send(result);
    } catch (error: any) {
      deps.logger.error('Enrollment failed', error);

      const standardError: StandardError | undefined = error.standardError;
      if (standardError) {
        const statusCode = getHttpStatusCode(standardError, true);
        return reply.code(statusCode).send({ error: standardError });
      }

      if (error.name === 'ZodError') {
        const validationError = makeValidationError({ issues: error.issues });
        return reply.code(400).send({ error: validationError });
      }

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
