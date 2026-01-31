/**
 * HTTP route: POST /api/commands/assessment.quiz.submit (Tuyến HTTP: Nộp bài kiểm tra)
 */

import type { FastifyInstance } from 'fastify';
import { commandRegistry } from '@dmf/contracts';
import { handleAssessmentQuizSubmit } from '../../application/assessment.quiz.submit.handler';
import { AssessmentRepository } from '../../state/assessment.repository';
import type { EventBus, Logger, AuditLogger, Database, IdempotencyStore, Outbox } from '@dmf/infra';
import { makeValidationError, getHttpStatusCode, StandardError } from '@dmf/shared';

export function registerAssessmentQuizSubmitRoute(
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
  app.post('/api/commands/assessment.quiz.submit', async (request, reply) => {
    const requestId = `req-${Date.now()}`;
    const userId = (request as any).user?.userId || '';
    const role = (request as any).user?.role || 'learner';

    try {
      const schema = commandRegistry['assessment.quiz.submit'];
      const command = schema.parse(request.body);

      const assessmentRepository = new AssessmentRepository(deps.database);

      const result = await handleAssessmentQuizSubmit(
        command,
        { userId, role },
        { assessmentRepository, eventBus: deps.eventBus, idempotencyStore: deps.idempotencyStore, outbox: deps.outbox }
      );

      deps.auditLogger.logCommandReceived('assessment.quiz.submit', userId, requestId, command.correlationId);

      // Check if idempotent replay (Kiểm tra phát lại idempotent)
      if ((result as any).replayed) {
        return reply.code(200).send({
          ...result,
          replayed: true,
        });
      }

      return reply.code(200).send(result);
    } catch (error: any) {
      deps.logger.error('Assessment quiz submit failed', error);

      const standardError: StandardError | undefined = error.standardError;
      if (standardError) {
        const statusCode = getHttpStatusCode(standardError, true);
        return reply.code(statusCode).send({ error: standardError });
      }

      if (error.name === 'ZodError') {
        const validationError = makeValidationError('Invalid command payload');
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
