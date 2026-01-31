/**
 * HTTP route: POST /api/learning/activity/submit (Tuyến HTTP: Nộp hoạt động)
 */

import type { FastifyInstance } from 'fastify';
import { commandRegistry } from '@dmf/contracts';
import { handleLearningActivitySubmit } from '../../application/learning.activity.submit.handler';
import { makeValidationError, getHttpStatusCode, StandardError, makeNotFound } from '@dmf/shared';
import type { PracticeDeps } from '../../composition-root';
import { getInstanceIds } from '../../composition-root';

export function registerLearningActivitySubmitRoute(app: FastifyInstance, deps: PracticeDeps) {
  app.post('/api/learning/activity/submit', async (request, reply) => {
    const requestId = `req-${Date.now()}`;

    try {
      const schema = commandRegistry['learning.activity.submit'];
      const command = schema.parse(request.body);

      // Temporary tracing: log request with instance IDs
      const instanceIds = getInstanceIds();
      deps.logger.info('[ROUTE] learning.activity.submit', {
        route: 'learning.activity.submit',
        attemptId: command.attemptId,
        correlationId: (command as any).correlationId,
        processId: instanceIds.processId,
        dbInstanceId: instanceIds.dbInstanceId,
        attemptRepoInstanceId: instanceIds.attemptRepoInstanceId,
        storeInstanceId: instanceIds.storeInstanceId,
      });

      // Derive context from auth if present, otherwise fallback to command payload (dev/E2E)
      const authUser = (request as any).user as { userId?: string; role?: string } | undefined;
      
      // Look up attempt to extract userId if not provided in auth/command
      const attempt = await deps.attemptRepository.findById(command.attemptId);
      
      // Temporary tracing: log attempt lookup result
      deps.logger.info('[ROUTE] attempt lookup result', {
        attemptId: command.attemptId,
        found: !!attempt,
        attemptUserId: attempt?.userId,
      });

      // Extract userId from attempt if not provided in auth/command (for E2E/dev mode)
      const contextUserId = authUser?.userId ?? (command as any).userId ?? attempt?.userId ?? '';
      const contextRole = authUser?.role ?? (command as any).role ?? 'learner';

      const result = await handleLearningActivitySubmit(
        command,
        { userId: contextUserId, role: contextRole } as any,
        {
          attemptRepository: deps.attemptRepository,
          submissionRepository: deps.submissionRepository,
          eventBus: deps.eventBus,
          idempotencyStore: deps.idempotencyStore,
          outbox: deps.outbox,
          logger: deps.logger,
        }
      );

      deps.auditLogger.logCommandReceived('learning.activity.submit', contextUserId, requestId, (command as any).correlationId);

      // Map response: id → submissionId (contract compliance with E2E/API contract)
      // Keep both id and submissionId for backward compatibility
      const response = {
        ...result,
        submissionId: (result as any).id,
      };

      // Check if idempotent replay (Kiểm tra phát lại idempotent)
      if ((result as any).replayed) {
        return reply.code(201).send(response);
      }

      return reply.code(201).send(response);
    } catch (error: any) {
      deps.logger.error('Activity submit failed', error);

      // Handle AuthorizationError (from failOwnership) - convert to StandardError NotFound
      if (error.name === 'AuthorizationError' && error.statusCode === 404) {
        const notFoundError = makeNotFound('Attempt', error.message.includes('id') ? error.message.match(/"([^"]+)"/)?.[1] : undefined);
        return reply.code(404).send({ error: notFoundError });
      }

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
