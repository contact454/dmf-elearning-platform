/**
 * Command handler: onboarding placement submission.
 * Emits assessment.level_test.completed after validation + idempotency checks.
 */

import type { UserId, CEFRLevel } from '@dmf/shared';
import { makeNotFound, CEFRLevel as CEFRLevelEnum } from '@dmf/shared';
import { makeIdempotencyKey } from '@dmf/infra';
import type { EventBus, IdempotencyStore, Outbox } from '@dmf/infra';
import { emitViaOutbox } from '@dmf/infra/adapters';
import type { UserRepository } from '../state/user.repository';

export interface SubmitPlacementTestCommand {
  userId: UserId;
  answers: unknown[];
  correlationId?: string;
}

export interface SubmitPlacementTestResult {
  assessmentId: string;
  level: CEFRLevel;
  nextAction: 'enroll' | 'retake';
  replayed?: boolean;
}

function resolveLevel(answers: unknown[]): CEFRLevel {
  if (answers.length >= 40) return CEFRLevelEnum.B2;
  if (answers.length >= 20) return CEFRLevelEnum.B1;
  return CEFRLevelEnum.A2;
}

export async function handleOnboardingPlacementSubmit(
  command: SubmitPlacementTestCommand,
  deps: {
    userRepository: UserRepository;
    eventBus: EventBus;
    idempotencyStore: IdempotencyStore;
    outbox: Outbox;
  }
): Promise<SubmitPlacementTestResult> {
  if (command.correlationId) {
    const idempotencyKey = makeIdempotencyKey('assessment.placement.take', command.correlationId);
    const existingResult = await deps.idempotencyStore.get(idempotencyKey);
    if (existingResult?.resultIds.assessmentId) {
      return {
        assessmentId: existingResult.resultIds.assessmentId,
        level: (existingResult.resultIds.level as CEFRLevel) ?? CEFRLevelEnum.B1,
        nextAction: 'enroll',
        replayed: true,
      };
    }
  }

  const user = await deps.userRepository.findById(command.userId);
  if (!user) {
    const notFound = makeNotFound('User', command.userId);
    const error = new Error(notFound.message);
    (error as { standardError?: unknown }).standardError = notFound;
    throw error;
  }

  const assessmentId = `assessment-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  const level = resolveLevel(command.answers);
  const eventId = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  const commandKey = command.correlationId || `placement:${command.userId}`;

  await emitViaOutbox(
    {
      eventName: 'assessment.level_test.completed',
      payload: {
        eventId,
        occurredAt: new Date().toISOString(),
        correlationId: command.correlationId,
        assessmentId,
        userId: user.id,
      },
    },
    deps.eventBus,
    deps.outbox,
    commandKey
  );

  if (command.correlationId) {
    const idempotencyKey = makeIdempotencyKey('assessment.placement.take', command.correlationId);
    await deps.idempotencyStore.set(idempotencyKey, {
      resultIds: { assessmentId, level },
      emittedEventIds: [eventId],
      timestamp: new Date().toISOString(),
    });
  }

  return {
    assessmentId,
    level,
    nextAction: 'enroll',
    replayed: false,
  };
}
