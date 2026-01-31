/**
 * Command Handler: system.user.register (Bộ xử lý Lệnh: đăng ký người dùng)
 */

import type { SystemUserRegisterCommand } from '@dmf/contracts';
import type { EventBus, AuditLogger } from '@dmf/infra';
import { userRepository } from '../../state/userRepository';

export async function handleSystemUserRegister(
  command: SystemUserRegisterCommand,
  context: { logger: AuditLogger; eventEmitter: EventBus }
): Promise<{ userId: string }> {
  const requestId = crypto.randomUUID();
  context.logger.logCommandReceived('system.user.register', 'anonymous', requestId, command.correlationId);

  // Validate firstName and lastName (required for User entity)
  if (!command.firstName || !command.lastName) {
    throw new Error('firstName and lastName are required');
  }

  // TODO: Hash password, create User and LearnerProfile
  const user = await userRepository.create({
    email: command.email,
    passwordHash: `hash_${command.password}`, // Simple hash for MVP
    firstName: command.firstName,
    lastName: command.lastName,
    role: 'learner',
  });

  await context.eventEmitter.emit({
    eventName: 'system.user.registered',
    payload: {
      eventId: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
      correlationId: command.correlationId,
      userId: user.id,
      // email/name NOT in payload - must be read from User entity per STEP 5C
    },
  });

  return { userId: user.id };
}
