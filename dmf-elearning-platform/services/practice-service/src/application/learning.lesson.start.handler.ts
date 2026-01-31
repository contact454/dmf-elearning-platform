/**
 * Command handler: learning.lesson.start (Bộ xử lý lệnh: Bắt đầu bài học)
 */

import type { LearningLessonStartCommand } from '@dmf/contracts';
import type { AttemptRepository } from '../state';
import type { EventBus, IdempotencyStore, Outbox } from '@dmf/infra';
import { forbidRole, makeNotFound } from '@dmf/shared';
import { AttemptStatus } from '@dmf/shared';
import { makeIdempotencyKey, makeNaturalKey } from '@dmf/infra';
import { emitViaOutbox } from '@dmf/infra/adapters';

export interface LearningLessonStartContext {
  userId: string;
  role: string;
}

export async function handleLearningLessonStart(
  command: LearningLessonStartCommand,
  context: LearningLessonStartContext,
  deps: {
    attemptRepository: AttemptRepository;
    eventBus: EventBus;
    idempotencyStore: IdempotencyStore;
    outbox: Outbox;
  }
) {
  // 1. Authz check (Kiểm tra phân quyền)
  forbidRole(context.role as any, ['learner']);

  // 2. Ownership check (Kiểm tra sở hữu)
  if (command.userId !== context.userId) {
    // Hide existence: return NotFound (per STEP 8B) (Ẩn sự tồn tại: trả về NotFound)
    const notFoundError = makeNotFound('Attempt');
    const error = new Error(notFoundError.message);
    (error as any).standardError = notFoundError;
    throw error;
  }

  // 3. Idempotency check (Kiểm tra idempotency)
  if (command.correlationId) {
    const idempotencyKey = makeIdempotencyKey('learning.lesson.start', command.correlationId);
    const existingResult = await deps.idempotencyStore.get(idempotencyKey);
    if (existingResult) {
      // Idempotent replay: return same result, do NOT emit event (Phát lại idempotent: trả về kết quả cũ, KHÔNG phát sự kiện)
      const attempt = await deps.attemptRepository.findById(existingResult.resultIds.attemptId as any);
      if (attempt) {
        return { ...attempt, replayed: true };
      }
    }
  }

  // 4. Check for existing in-progress attempt (natural key) (Kiểm tra attempt đang tiến hành - khóa tự nhiên)
  const existingAttempts = await deps.attemptRepository.findByUserAndLesson(
    command.userId,
    command.lessonId
  );
  const inProgressAttempt = existingAttempts.find((a) => a.status === AttemptStatus.IN_PROGRESS);
  if (inProgressAttempt) {
    // If no correlationId, return existing attempt (Nếu không có correlationId, trả về attempt hiện có)
    if (!command.correlationId) {
      return inProgressAttempt;
    }
    // If correlationId exists but attempt exists, check if it's from same correlationId
    // (Nếu correlationId tồn tại nhưng attempt đã tồn tại, kiểm tra xem có phải từ cùng correlationId)
    const naturalKey = makeNaturalKey('attempt', command.userId, command.lessonId, AttemptStatus.IN_PROGRESS);
    const naturalKeyResult = await deps.idempotencyStore.get(naturalKey);
    if (naturalKeyResult && naturalKeyResult.resultIds.attemptId === inProgressAttempt.id) {
      // Same attempt from previous request (Cùng attempt từ yêu cầu trước)
      return inProgressAttempt;
    }
    // Different correlationId, return existing attempt (Khác correlationId, trả về attempt hiện có)
    return inProgressAttempt;
  }

  // 5. Create Attempt (Tạo Attempt)
  const attempt = await deps.attemptRepository.create({
    userId: command.userId,
    lessonId: command.lessonId,
    status: AttemptStatus.IN_PROGRESS,
    startedAt: new Date(),
  });

  // 6. Emit event via outbox (write-then-emit safety) (Phát sự kiện qua outbox - an toàn ghi rồi mới phát)
  const eventId = generateEventId();
  const commandKey = command.correlationId || makeNaturalKey('attempt', command.userId, command.lessonId, AttemptStatus.IN_PROGRESS);
  await emitViaOutbox(
    {
      eventName: 'learning.lesson.started',
      payload: {
        eventId,
        occurredAt: new Date().toISOString(),
        correlationId: command.correlationId,
        attemptId: attempt.id,
        userId: attempt.userId,
        lessonId: attempt.lessonId,
      },
    },
    deps.eventBus,
    deps.outbox,
    commandKey
  );

  // 7. Store idempotency result (Lưu kết quả idempotency)
  if (command.correlationId) {
    const idempotencyKey = makeIdempotencyKey('learning.lesson.start', command.correlationId);
    await deps.idempotencyStore.set(idempotencyKey, {
      resultIds: { attemptId: attempt.id },
      emittedEventIds: [eventId],
      timestamp: new Date().toISOString(),
    });
  }

  // Also store natural key (userId + lessonId + in-progress) (Cũng lưu khóa tự nhiên)
  const naturalKey = makeNaturalKey('attempt', command.userId, command.lessonId, AttemptStatus.IN_PROGRESS);
  await deps.idempotencyStore.set(naturalKey, {
    resultIds: { attemptId: attempt.id },
    emittedEventIds: [eventId],
    timestamp: attempt.startedAt.toISOString(),
  });

  return attempt;
}

function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
