/**
 * HTTP route: POST /api/system/profile/modify (Tuyến HTTP: Sửa hồ sơ)
 */

import type { FastifyInstance } from 'fastify';
import { commandRegistry } from '@dmf/contracts';
import { handleSystemProfileModify } from '../../application/system.profile.modify.handler';
import { UserRepository } from '../../state/user.repository';
import type { EventBus, Logger, AuditLogger, Database, IdempotencyStore, Outbox } from '@dmf/infra';
import { failOwnership } from '@dmf/shared';

export function registerSystemProfileModifyRoute(
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
  app.post('/api/system/profile/modify', async (request, reply) => {
    const requestId = `req-${Date.now()}`;
    const userId = (request as any).user?.userId || ''; // TODO: Extract from auth token

    try {
      const schema = commandRegistry['system.profile.modify'];
      const command = schema.parse(request.body);

      // M1-lite: allow no-auth flow (userId absent), enforce ownership only if auth exists.
      if (userId && command.userId !== userId) {
        failOwnership('User', command.userId);
      }

      const userRepository = new UserRepository(deps.database);
      const result = await handleSystemProfileModify(
        command,
        { userId },
        {
          userRepository,
          eventBus: deps.eventBus,
          idempotencyStore: deps.idempotencyStore,
          outbox: deps.outbox,
        }
      );

      deps.auditLogger.logCommandReceived(
        'system.profile.modify',
        command.userId,
        requestId,
        command.correlationId
      );

      return reply.code(200).send(result);
    } catch (error: any) {
      deps.logger.error('Profile modify failed', error);
      const statusCode = error.statusCode || 500;
      return reply.code(statusCode).send({ error: error.message, code: error.code || 'INTERNAL_ERROR' });
    }
  });
}
