/**
 * HTTP route: POST /api/learning/lesson/complete (Tuyến HTTP: Hoàn thành bài học)
 */

import type { FastifyInstance } from 'fastify';
import { commandRegistry } from '@dmf/contracts';
import { handleLearningLessonComplete } from '../../application/learning.lesson.complete.handler';
import { makeValidationError, getHttpStatusCode, StandardError, makeNotFound } from '@dmf/shared';
import type { PracticeDeps } from '../../composition-root';

export function registerLearningLessonCompleteRoute(app: FastifyInstance, deps: PracticeDeps) {
  app.post('/api/learning/lesson/complete', async (request, reply) => {
    const requestId = `req-${Date.now()}`;
    
    // Derive context from auth if present, otherwise fallback to command payload (dev/E2E)
    const authUser = (request as any).user as { userId?: string; role?: string } | undefined;

    try {
      const schema = commandRegistry['learning.lesson.complete'];
      const command = schema.parse(request.body);

      // Look up attempt BEFORE calling handler to extract userId if not provided in auth/command
      const attempt = await deps.attemptRepository.findById(command.attemptId);

      // Extract userId from attempt if not provided in auth/command (for E2E/dev mode)
      const contextUserId = authUser?.userId ?? (command as any).userId ?? attempt?.userId ?? '';
      const contextRole = authUser?.role ?? (command as any).role ?? 'learner';

      const result = await handleLearningLessonComplete(
        command,
        { userId: contextUserId, role: contextRole } as any,
        { 
          attemptRepository: deps.attemptRepository, 
          eventBus: deps.eventBus, 
          idempotencyStore: deps.idempotencyStore,
          outbox: deps.outbox 
        }
      );

      deps.auditLogger.logCommandReceived('learning.lesson.complete', contextUserId, requestId, command.correlationId);

      return reply.code(200).send(result);
    } catch (error: any) {
      deps.logger.error('Lesson complete failed', error);

      // Handle "Attempt not found" error - convert to proper NotFound (404)
      if (error.message && error.message.includes('Attempt not found')) {
        const attemptId = error.message.match(/"([^"]+)"/)?.[1];
        const notFoundError = makeNotFound('Attempt', attemptId);
        return reply.code(404).send({ error: notFoundError });
      }

      // Handle AuthorizationError (from failOwnership) - convert to StandardError NotFound
      if (error.name === 'AuthorizationError' && error.statusCode === 404) {
        const attemptId = error.message.includes('id') ? error.message.match(/"([^"]+)"/)?.[1] : undefined;
        const notFoundError = makeNotFound('Attempt', attemptId);
        return reply.code(404).send({ error: notFoundError });
      }

      const standardError: StandardError | undefined = error.standardError;
      if (standardError) {
        const statusCode = getHttpStatusCode(standardError);
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
