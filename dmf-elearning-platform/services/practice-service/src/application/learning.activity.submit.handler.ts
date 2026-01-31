/**
 * Command handler: learning.activity.submit (Bộ xử lý lệnh: Nộp hoạt động)
 */

import type { LearningActivitySubmitCommand } from '@dmf/contracts';
import type { AttemptRepository } from '../state';
import type { SubmissionRepository } from '../state';
import type { EventBus, IdempotencyStore, Outbox, Logger } from '@dmf/infra';
import { failOwnership, makeNotFound, AttemptStatus } from '@dmf/shared';
import { makeIdempotencyKey, makeNaturalKey } from '@dmf/infra';
import { emitViaOutbox } from '@dmf/infra/adapters';

export interface LearningActivitySubmitContext {
  userId: string;
}

export async function handleLearningActivitySubmit(
  command: LearningActivitySubmitCommand,
  context: LearningActivitySubmitContext,
  deps: {
    attemptRepository: AttemptRepository;
    submissionRepository: SubmissionRepository;
    eventBus: EventBus;
    idempotencyStore: IdempotencyStore;
    outbox: Outbox;
    logger: Logger;
  }
) {
  // 1. Load Attempt (Tải Attempt)
  deps.logger.info(`Looking up attempt with id: ${command.attemptId}`);
  const attempt = await deps.attemptRepository.findById(command.attemptId);
  
  if (!attempt) {
    deps.logger.warn(`Attempt not found: ${command.attemptId}`);
    const notFoundError = makeNotFound('Attempt', command.attemptId);
    const error = new Error(notFoundError.message);
    (error as any).standardError = notFoundError;
    throw error;
  }

  // 2. Ownership check (Kiểm tra sở hữu)
  if (attempt.userId !== context.userId) {
    failOwnership('Attempt', command.attemptId);
  }

  // 2.5. Validate attempt belongs to lesson (if lessonId provided in command)
  if ((command as any).lessonId && attempt.lessonId !== (command as any).lessonId) {
    failOwnership('Attempt', command.attemptId);
  }

  // 2.6. Validate attempt status (CRITICAL: only IN_PROGRESS attempts can accept submissions)
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
  if (command.correlationId) {
    const idempotencyKey = makeIdempotencyKey('learning.activity.submit', command.correlationId);
    const existingResult = await deps.idempotencyStore.get(idempotencyKey);
    if (existingResult) {
      // Idempotent replay: return same result, do NOT emit event (Phát lại idempotent: trả về kết quả cũ, KHÔNG phát sự kiện)
      const submission = await deps.submissionRepository.findById(existingResult.resultIds.submissionId as any);
      if (submission) {
        return { ...submission, replayed: true };
      }
    }
  }

  // 4. Check for existing submission (natural key: attemptId + activityId) (Kiểm tra submission đã tồn tại - khóa tự nhiên)
  // Note: In MVP, we allow multiple submissions per attempt+activity, but check natural key for idempotency
  // (Lưu ý: Trong MVP, cho phép nhiều submission mỗi attempt+activity, nhưng kiểm tra khóa tự nhiên cho idempotency)
  const naturalKey1 = makeNaturalKey('submission', command.attemptId, command.activityId);
    const naturalKeyResult = await deps.idempotencyStore.get(naturalKey1);
    if (naturalKeyResult && command.correlationId && naturalKeyResult.resultIds.correlationId === command.correlationId) {
      // Same submission from previous request with same correlationId (Cùng submission từ yêu cầu trước với cùng correlationId)
      const submission = await deps.submissionRepository.findById(naturalKeyResult.resultIds.submissionId as any);
      if (submission) {
        return { ...submission, replayed: true };
      }
    }

  // 5. Create Submission (Tạo Submission)
  const submissionId = `submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as any;
  const submission = await deps.submissionRepository.create({
    id: submissionId,
    attemptId: command.attemptId,
    activityId: command.activityId,
    type: command.type,
    answer: command.answer,
    audioUrl: command.audioUrl,
    createdAt: new Date(),
  });

  // 6. Emit event via outbox (write-then-emit safety) (Phát sự kiện qua outbox - an toàn ghi rồi mới phát)
  const eventId = generateEventId();
  const commandKey = command.correlationId || makeNaturalKey('submission', command.attemptId, command.activityId);
  await emitViaOutbox(
    {
      eventName: 'learning.submission.created',
      payload: {
        eventId,
        occurredAt: new Date().toISOString(),
        correlationId: command.correlationId,
        submissionId: submission.id,
        attemptId: submission.attemptId,
        activityId: submission.activityId,
        lessonId: attempt.lessonId, // From Attempt
      },
    },
    deps.eventBus,
    deps.outbox,
    commandKey
  );

  // 7. Store idempotency result (Lưu kết quả idempotency)
  if (command.correlationId) {
    const idempotencyKey = makeIdempotencyKey('learning.activity.submit', command.correlationId);
    await deps.idempotencyStore.set(idempotencyKey, {
      resultIds: { submissionId: submission.id, correlationId: command.correlationId },
      emittedEventIds: [eventId],
      timestamp: new Date().toISOString(),
    });
  }

  // Also store natural key (attemptId + activityId) (Cũng lưu khóa tự nhiên)
  const naturalKey2 = makeNaturalKey('submission', command.attemptId, command.activityId);
  await deps.idempotencyStore.set(naturalKey2, {
    resultIds: { submissionId: submission.id, correlationId: command.correlationId || '' },
    emittedEventIds: [eventId],
    timestamp: submission.createdAt.toISOString(),
  });

  return submission;
}

function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
