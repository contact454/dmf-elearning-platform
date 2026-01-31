/**
 * Command Handler: learning.lesson.complete (Bộ xử lý Lệnh: hoàn thành bài học)
 * Updates Attempt entity (owned write state)
 * 
 * NOTE: This handler is LEGACY/UNUSED. The active handler is in ../learning.lesson.complete.handler.ts
 * This file is kept for reference but is not used by any active routes.
 * If this needs to be used, it must be refactored to use AttemptRepository class instead of singleton.
 */

// @ts-nocheck - Legacy unused handler
import type { LearningLessonCompleteCommand } from '@dmf/contracts';
import { forbidRole, failOwnership } from '@dmf/shared';
import type { EventBus, AuditLogger } from '@dmf/infra';

export interface HandlerContext {
  userId: string;
  role: string;
  logger: AuditLogger;
  eventEmitter: EventBus;
}

export async function handleLearningLessonComplete(
  command: LearningLessonCompleteCommand,
  context: HandlerContext
): Promise<{ success: boolean }> {
  // 1. Authz check (kiểm tra phân quyền)
  forbidRole(context.role as any, ['learner']);

  // 2. Log command received
  const requestId = crypto.randomUUID();
  context.logger.logCommandReceived('learning.lesson.complete', context.userId, requestId);

  // 3. Ownership check (kiểm tra quyền sở hữu) - returns 404 if not owned
  const attempt = await attemptRepository.findById(command.attemptId);
  if (!attempt) {
    failOwnership('Attempt', command.attemptId);
  }
  if (attempt.userId !== context.userId) {
    failOwnership('Attempt', command.attemptId); // 404 to hide existence
  }

  // 4. Business logic
  attempt.status = 'completed';
  attempt.completedAt = new Date();
  await attemptRepository.save(attempt);

  // 5. Emit event - IDs-only payload
  await context.eventEmitter.emit({
    eventName: 'learning.lesson.completed',
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
