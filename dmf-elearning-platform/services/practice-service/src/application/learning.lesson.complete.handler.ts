/**
 * Command handler: learning.lesson.complete (Bộ xử lý lệnh: Hoàn thành bài học)
 */

import type { LearningLessonCompleteCommand } from '@dmf/contracts';
import type { AttemptRepository } from '../state';
import type { EventBus, IdempotencyStore, Outbox } from '@dmf/infra';
import { failOwnership, makeNotFound } from '@dmf/shared';
import { AttemptStatus } from '@dmf/shared';
import { emitViaOutbox } from '@dmf/infra/adapters';
import { makeNaturalKey, makeIdempotencyKey } from '@dmf/infra';

export interface LearningLessonCompleteContext {
  userId: string;
}

export async function handleLearningLessonComplete(
  command: LearningLessonCompleteCommand,
  context: LearningLessonCompleteContext,
  deps: {
    attemptRepository: AttemptRepository;
    eventBus: EventBus;
    idempotencyStore: IdempotencyStore;
    outbox: Outbox;
  }
) {
  // 1. Load Attempt (Tải Attempt)
  const attempt = await deps.attemptRepository.findById(command.attemptId);
  
  if (!attempt) {
    const notFoundError = makeNotFound('Attempt', command.attemptId);
    const error = new Error(notFoundError.message);
    (error as any).standardError = notFoundError;
    throw error;
  }

  // 2. Ownership check (Kiểm tra sở hữu)
  if (attempt.userId !== context.userId) {
    failOwnership('Attempt', command.attemptId);
  }

  // 2.5. Validate attempt status (CRITICAL: only IN_PROGRESS attempts can be completed)
  if (attempt.status !== AttemptStatus.IN_PROGRESS) {
    const error = new Error(`Attempt ${command.attemptId} is not in progress (status: ${attempt.status})`);
    (error as any).standardError = {
      code: 'VALIDATION_ERROR',
      category: 'ClientError',
      message: error.message,
    };
    throw error;
  }

  // 3. Idempotency check (Kiểm tra idempotency)
  const correlationId = (command as any).correlationId;
  if (correlationId) {
    const idempotencyKey = makeIdempotencyKey('learning.lesson.complete', correlationId);
    const existingResult = await deps.idempotencyStore.get(idempotencyKey);
    if (existingResult) {
      // Idempotent replay: return same result, do NOT emit event
      const completedAttempt = await deps.attemptRepository.findById(command.attemptId);
      if (completedAttempt) {
        return { ...completedAttempt, replayed: true };
      }
    }
  }

  // 4. Update Attempt (Cập nhật Attempt)
  // Map command.status ('completed' | 'abandoned') to AttemptStatus type
  const updated = await deps.attemptRepository.update(command.attemptId, {
    status: command.status === 'completed' ? AttemptStatus.COMPLETED : AttemptStatus.ABANDONED,
    completedAt: command.status === 'completed' ? new Date() : undefined,
    abandonedAt: command.status === 'abandoned' ? new Date() : undefined,
  });

  // 5. Emit event via outbox (write-then-emit safety) (Phát sự kiện qua outbox - an toàn ghi rồi mới phát)
  if (command.status === 'completed') {
    const eventId = generateEventId();
    const commandKey = correlationId || makeNaturalKey('attempt', updated.id, 'completed');
    await emitViaOutbox(
      {
        eventName: 'learning.lesson.completed',
        payload: {
          eventId,
          occurredAt: new Date().toISOString(),
          correlationId: correlationId,
          attemptId: updated.id,
          userId: updated.userId,
          lessonId: updated.lessonId,
        },
      },
      deps.eventBus,
      deps.outbox,
      commandKey
    );

    // 6. Store idempotency result (Lưu kết quả idempotency)
    if (correlationId) {
      const idempotencyKey = makeIdempotencyKey('learning.lesson.complete', correlationId);
      await deps.idempotencyStore.set(idempotencyKey, {
        resultIds: { attemptId: updated.id },
        emittedEventIds: [eventId],
        timestamp: new Date().toISOString(),
      });
    }
  }

  return updated;
}

function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
