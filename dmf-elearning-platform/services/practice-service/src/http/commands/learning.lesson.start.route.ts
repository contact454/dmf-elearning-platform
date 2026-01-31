/**
 * HTTP route: POST /api/learning/lesson/start (Tuyến HTTP: Bắt đầu bài học)
 */

import type { FastifyInstance } from 'fastify';
import { commandRegistry } from '@dmf/contracts';
import { handleLearningLessonStart } from '../../application/learning.lesson.start.handler';
import { makeValidationError, getHttpStatusCode, StandardError } from '@dmf/shared';
import type { PracticeDeps } from '../../composition-root';
import { getInstanceIds } from '../../composition-root';

export function registerLearningLessonStartRoute(app: FastifyInstance, deps: PracticeDeps) {
  app.post('/api/learning/lesson/start', async (request, reply) => {
    const requestId = `req-${Date.now()}`;
    const role = (request as any).user?.role || 'learner';

    try {
      const schema = commandRegistry['learning.lesson.start'];
      const command = schema.parse(request.body);

      // Temporary tracing: log request with instance IDs
      const instanceIds = getInstanceIds();
      deps.logger.info('[ROUTE] learning.lesson.start', {
        route: 'learning.lesson.start',
        correlationId: command.correlationId,
        processId: instanceIds.processId,
        dbInstanceId: instanceIds.dbInstanceId,
        attemptRepoInstanceId: instanceIds.attemptRepoInstanceId,
        storeInstanceId: instanceIds.storeInstanceId,
      });

      // Extract userId from auth token, fallback to command.userId for dev/E2E
      // TODO: In production, always require auth token
      const userId = (request as any).user?.userId || command.userId;

      const result = await handleLearningLessonStart(
        command,
        { userId, role },
        {
          attemptRepository: deps.attemptRepository,
          eventBus: deps.eventBus,
          idempotencyStore: deps.idempotencyStore,
          outbox: deps.outbox,
        }
      );

      deps.auditLogger.logCommandReceived('learning.lesson.start', userId, requestId, command.correlationId);

      // Check if idempotent replay (Kiểm tra phát lại idempotent)
      if ((result as any).replayed) {
        return reply.code(201).send({
          ...result,
          replayed: true,
        });
      }

      return reply.code(201).send(result);
    } catch (error: any) {
      deps.logger.error('Lesson start failed', error);

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
