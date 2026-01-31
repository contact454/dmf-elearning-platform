/**
 * Command Handler: learning.lesson.abandon (Bộ xử lý Lệnh: bỏ dở bài học)
 * Updates Attempt entity (owned write state)
 * 
 * NOTE: This handler is LEGACY/UNUSED. This file is kept for reference but is not used by any active routes.
 * If this needs to be used, it must be refactored to use AttemptRepository class instead of singleton.
 */

// @ts-nocheck - Legacy unused handler
import type { LearningLessonAbandonCommand } from '@dmf/contracts';
import { forbidRole, failOwnership } from '@dmf/shared';
import type { EventBus, AuditLogger } from '@dmf/infra';

export interface HandlerContext {
  userId: string;
  role: string;
  logger: AuditLogger;
  eventEmitter: EventBus;
}

export async function handleLearningLessonAbandon(
  command: LearningLessonAbandonCommand,
  context: HandlerContext
): Promise<{ success: boolean }> {
  forbidRole(context.role as any, ['learner']);
  const requestId = crypto.randomUUID();
  context.logger.logCommandReceived('learning.lesson.abandon', context.userId, requestId);

  const attempt = await attemptRepository.findById(command.attemptId);
  if (!attempt || attempt.userId !== context.userId) {
    failOwnership('Attempt', command.attemptId);
  }

  attempt.status = 'abandoned';
  attempt.abandonedAt = new Date();
  await attemptRepository.save(attempt);

  await context.eventEmitter.emit({
    eventName: 'learning.lesson.abandoned',
    payload: {
      eventId: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
      lessonId: attempt.lessonId,
      attemptId: attempt.id,
      // userId is NOT in payload - must be read from Attempt entity per STEP 5C
    },
  });

  return { success: true };
}
