/**
 * Command Endpoints (Điểm cuối Lệnh)
 * system.user.register, system.user.login, system.profile.modify
 */

import type { FastifyInstance } from 'fastify';
import { commandRegistry } from '@dmf/contracts';
import type { EventBus, AuditLogger } from '@dmf/infra';
import type { SystemUserRegisterCommand, SystemUserLoginCommand, SystemProfileModifyCommand } from '@dmf/contracts';
import { handleSystemUserRegister } from '../application/handlers/systemUserRegister';
import { handleSystemUserLogin } from '../application/handlers/systemUserLogin';
import { handleSystemProfileModify } from '../application/handlers/systemProfileModify';

interface ServiceContext {
  logger: AuditLogger;
  eventEmitter: EventBus;
}

export function setupCommandRoutes(server: FastifyInstance, context: ServiceContext): void {
  server.post('/api/system/user/register', async (request, reply) => {
    try {
      const schema = commandRegistry['system.user.register'];
      const parsed = schema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.message });
      }
      const command = parsed.data as SystemUserRegisterCommand;
      const result = await handleSystemUserRegister(command, context);
      return reply.code(201).send(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(400).send({ error: message });
    }
  });

  server.post('/api/system/user/login', async (request, reply) => {
    try {
      const schema = commandRegistry['system.user.login'];
      const parsed = schema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.message });
      }
      const command = parsed.data as SystemUserLoginCommand;
      const result = await handleSystemUserLogin(command, context);
      return reply.code(200).send(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(400).send({ error: message });
    }
  });

  server.patch('/api/system/profile/modify', async (request, reply) => {
    try {
      const authUser = (request as any).user as { userId?: string; role?: string } | undefined;
      const schema = commandRegistry['system.profile.modify'];
      const parsed = schema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.message });
      }
      const command = parsed.data as SystemProfileModifyCommand;
      const result = await handleSystemProfileModify(command, {
        userId: authUser?.userId || '',
        role: authUser?.role || '',
        ...context,
      });
      return reply.code(200).send(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(400).send({ error: message });
    }
  });
}
