/**
 * HTTP route: POST /api/system/user/register (Tuyến HTTP: Đăng ký người dùng)
 */

import type { FastifyInstance } from 'fastify';
import { commandRegistry } from '@dmf/contracts';
import { handleSystemUserRegister } from '../../application/system.user.register.handler';
import { UserRepository } from '../../state/user.repository';
import type { EventBus, Logger, AuditLogger, Database, IdempotencyStore, Outbox } from '@dmf/infra';
import { makeValidationError, getHttpStatusCode, StandardError } from '@dmf/shared';

export function registerSystemUserRegisterRoute(
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
  app.post('/api/system/user/register', async (request, reply) => {
    const requestId = `req-${Date.now()}`;

    try {
      // 1. Validate command payload (Xác thực tải trọng lệnh)
      const schema = commandRegistry['system.user.register'];
      const command = schema.parse(request.body);

      // 2. Handle command (Xử lý lệnh)
      const userRepository = new UserRepository(deps.database);
      const result = await handleSystemUserRegister(
        command,
        {},
        {
          userRepository,
          eventBus: deps.eventBus,
          idempotencyStore: deps.idempotencyStore,
          outbox: deps.outbox,
        }
      );

      // 3. Check if idempotent replay (Kiểm tra phát lại idempotent)
      if ((result as any).replayed) {
        const replayResult = result as any;
        deps.auditLogger.logCommandReceived(
          'system.user.register',
          replayResult.userId,
          requestId,
          command.correlationId
        );
        return reply.code(201).send({
          ...replayResult,
          replayed: true,
        });
      }

      // 4. Audit log (Ghi log kiểm toán)
      deps.auditLogger.logCommandReceived(
        'system.user.register',
        result.userId,
        requestId,
        command.correlationId
      );

      return reply.code(201).send(result);
    } catch (error: any) {
      deps.logger.error('Command failed', error);

      // Handle StandardError (Xử lý StandardError)
      const standardError: StandardError | undefined = error.standardError;
      if (standardError) {
        const statusCode = getHttpStatusCode(standardError, true);
        return reply.code(statusCode).send({
          error: standardError,
        });
      }

      // Handle Zod validation errors (Xử lý lỗi xác thực Zod)
      if (error.name === 'ZodError') {
        const validationError = makeValidationError({
          issues: error.issues,
        });
        return reply.code(400).send({
          error: validationError,
        });
      }

      // Default error (Lỗi mặc định)
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
