/**
 * Command handler: system.profile.modify (Bộ xử lý lệnh: Sửa hồ sơ)
 */

import type { SystemProfileModifyCommand } from '@dmf/contracts';
import type { UserRepository } from '../state/user.repository';
import type { EventBus, IdempotencyStore, Outbox } from '@dmf/infra';
import { makeIdempotencyKey } from '@dmf/infra';
import { makeNotFound } from '@dmf/shared';
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
    idempotencyStore: IdempotencyStore;
    outbox: Outbox;
  }
) {
  if (command.correlationId) {
    const idempotencyKey = makeIdempotencyKey('system.profile.modify', command.correlationId);
    const existingResult = await deps.idempotencyStore.get(idempotencyKey);
    if (existingResult) {
      return {
        userId: existingResult.resultIds.userId,
        replayed: true,
      };
    }
  }

  const existingUser = await deps.userRepository.findById(command.userId);
  if (!existingUser) {
    const notFound = makeNotFound('User', command.userId);
    const error = new Error(notFound.message);
    (error as { standardError?: unknown }).standardError = notFound;
    throw error;
  }

  const previousLearningLanguage = existingUser.targetLanguage;
  const learningLanguage = command.targetLanguage ?? existingUser.targetLanguage;
  const learningLanguageChanged =
    command.targetLanguage !== undefined &&
    command.targetLanguage !== previousLearningLanguage;

  const user = await deps.userRepository.update(command.userId, {
    firstName: command.firstName,
    lastName: command.lastName,
    targetLanguage: command.targetLanguage,
  });

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
        learningLanguageChanged,
        previousLearningLanguage,
        learningLanguage,
      },
    },
    deps.eventBus,
    deps.outbox,
    commandKey
  );

  if (command.correlationId) {
    const idempotencyKey = makeIdempotencyKey('system.profile.modify', command.correlationId);
    await deps.idempotencyStore.set(idempotencyKey, {
      resultIds: { userId: user.id },
      emittedEventIds: [eventId],
      timestamp: new Date().toISOString(),
    });
  }

  return { userId: user.id, replayed: false };
}

function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
