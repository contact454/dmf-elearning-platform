/**
 * Command Handler: learning.lesson.start (Bộ xử lý Lệnh: bắt đầu bài học)
 * Creates Attempt entity (owned write state)
 * 
 * NOTE: This handler is LEGACY/UNUSED. The active handler is in ../learning.lesson.start.handler.ts
 * This file is kept for reference but is not used by any active routes.
 * If this needs to be used, it must be refactored to use AttemptRepository class instead of singleton.
 */

// @ts-nocheck - Legacy unused handler
import type { LearningLessonStartCommand } from '@dmf/contracts';
import { forbidRole } from '@dmf/shared';
import type { EventBus, AuditLogger } from '@dmf/infra';

export interface HandlerContext {
  userId: string;
  role: string;
  logger: AuditLogger;
  eventEmitter: EventBus;
}

export async function handleLearningLessonStart(
  command: LearningLessonStartCommand,
  context: HandlerContext
): Promise<{ attemptId: string }> {
  // 1. Authz check (kiểm tra phân quyền)
  forbidRole(context.role as any, ['learner']); // Only learners can start lessons

  // 2. Log command received (ghi log lệnh nhận được)
  const requestId = crypto.randomUUID();
  context.logger.logCommandReceived('learning.lesson.start', context.userId, requestId, command.correlationId);

  // 3. Business logic (logic nghiệp vụ)
  // TODO: Validate user exists (read-only lookup to onboarding-service)
  // TODO: Validate lesson exists (read-only lookup to curriculum-service)
  // TODO: Check unlock eligibility (read-only lookup to progress-service)

  // 4. Create Attempt entity (tạo thực thể Attempt)
  const attempt = await attemptRepository.create({
    userId: context.userId,
    lessonId: command.lessonId,
    status: 'in-progress',
    startedAt: new Date(),
  });

  // 5. Emit event (phát sự kiện) - IDs-only payload per STEP 5C
  await context.eventEmitter.emit({
    eventName: 'learning.lesson.started',
    payload: {
      eventId: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
      correlationId: command.correlationId,
      lessonId: command.lessonId,
      attemptId: attempt.id,
      // userId is NOT in payload - must be read from Attempt entity per STEP 5C
    },
  });

  return { attemptId: attempt.id };
}
