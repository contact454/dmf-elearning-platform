/**
 * Command Handler: system.profile.modify (Bộ xử lý Lệnh: sửa hồ sơ)
 */

import type { SystemProfileModifyCommand } from '@dmf/contracts';
import { forbidRole, failOwnership } from '@dmf/shared';
import type { EventBus, AuditLogger } from '@dmf/infra';
import { userRepository } from '../../state/userRepository';

export async function handleSystemProfileModify(
  command: SystemProfileModifyCommand,
  context: { userId: string; role: string; logger: AuditLogger; eventEmitter: EventBus }
): Promise<{ success: boolean }> {
  forbidRole(context.role as any, ['learner', 'teacher', 'mentor']);
  const requestId = crypto.randomUUID();
  context.logger.logCommandReceived('system.profile.modify', command.userId, requestId, command.correlationId);

  if (command.userId !== context.userId) {
    failOwnership('User', command.userId); // 404 to hide existence
  }

  const user = await userRepository.findById(command.userId);
  if (!user) {
    failOwnership('User', command.userId);
  }

  // TODO: Update user/profile fields
  await userRepository.save(user);

  await context.eventEmitter.emit({
    eventName: 'system.profile.updated',
    payload: {
      eventId: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
      correlationId: command.correlationId,
      userId: command.userId,
      // updatedFields NOT in payload - must be read from User entity per STEP 5C
    },
  });

  return { success: true };
}
