/**
 * Command handler: system.profile.modify (Bộ xử lý lệnh: Sửa hồ sơ)
 */

import type { SystemProfileModifyCommand } from '@dmf/contracts';
import type { UserRepository } from '../state/user.repository';
import type { EventBus, Outbox } from '@dmf/infra';
import { emitViaOutbox } from '@dmf/infra/adapters';

export interface SystemProfileModifyContext {
  userId: string;
}

export async function handleSystemProfileModify(
  command: SystemProfileModifyCommand,
  _context: SystemProfileModifyContext,
  deps: {
    userRepository: UserRepository;
    eventBus: EventBus;
    outbox: Outbox;
  }
) {
  // 1. Update User entity (Cập nhật thực thể User)
  const user = await deps.userRepository.update(command.userId, {
    firstName: command.firstName,
    lastName: command.lastName,
    targetLanguage: command.targetLanguage,
  });

  // 2. Emit event via outbox (write-then-emit safety) (Phát sự kiện qua outbox - an toàn ghi rồi mới phát)
  const eventId = generateEventId();
  const commandKey = command.correlationId || `profile:${user.id}`;
  await emitViaOutbox(
    {
      eventName: 'system.profile.updated',
      payload: {
        eventId,
        occurredAt: new Date().toISOString(),
        correlationId: command.correlationId,
        userId: user.id,
      },
    },
    deps.eventBus,
    deps.outbox,
    commandKey
  );

  return { userId: user.id };
}

function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
