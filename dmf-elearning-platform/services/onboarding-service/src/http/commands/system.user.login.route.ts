/**
 * HTTP route: POST /api/system/user/login (Tuyến HTTP: Đăng nhập)
 */

import type { FastifyInstance } from 'fastify';
import { commandRegistry } from '@dmf/contracts';
import { handleSystemUserLogin } from '../../application/system.user.login.handler';
import { UserRepository } from '../../state/user.repository';
import type { EventBus, Logger, AuditLogger, Database, Outbox } from '@dmf/infra';
import { makeValidationError, getHttpStatusCode, StandardError } from '@dmf/shared';

export function registerSystemUserLoginRoute(
  app: FastifyInstance,
  deps: {
    eventBus: EventBus;
    database: Database;
    logger: Logger;
    auditLogger: AuditLogger;
    outbox: Outbox;
  }
) {
  app.post('/api/system/user/login', async (request, reply) => {
    const requestId = `req-${Date.now()}`;

    try {
      const schema = commandRegistry['system.user.login'];
      const command = schema.parse(request.body);

      const userRepository = new UserRepository(deps.database);
      const result = await handleSystemUserLogin(command, {}, { userRepository, eventBus: deps.eventBus, outbox: deps.outbox });

      deps.auditLogger.logCommandReceived('system.user.login', result.userId, requestId, command.correlationId);

      return reply.code(200).send(result);
    } catch (error: any) {
      deps.logger.error('Login failed', error);

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
