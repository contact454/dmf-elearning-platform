/**
 * Command Handler: learning.activity.submit (Bộ xử lý Lệnh: nộp câu trả lời)
 * Creates Submission entity (owned write state)
 * 
 * NOTE: This handler is LEGACY/UNUSED. The active handler is in ../learning.activity.submit.handler.ts
 * This file is kept for reference but is not used by any active routes.
 * If this needs to be used, it must be refactored to use AttemptRepository class instead of singleton.
 */

// @ts-nocheck - Legacy unused handler
import type { LearningActivitySubmitCommand } from '@dmf/contracts';
import { forbidRole, failOwnership } from '@dmf/shared';
import type { EventBus, AuditLogger } from '@dmf/infra';
import { submissionRepository } from '../../state/submissionRepository';

export interface HandlerContext {
  userId: string;
  role: string;
  logger: AuditLogger;
  eventEmitter: EventBus;
}

export async function handleLearningActivitySubmit(
  command: LearningActivitySubmitCommand,
  context: HandlerContext
): Promise<{ submissionId: string }> {
  forbidRole(context.role as any, ['learner']);
  const requestId = crypto.randomUUID();
  context.logger.logCommandReceived('learning.activity.submit', context.userId, requestId, command.correlationId);

  // Ownership check via Attempt
  const attempt = await attemptRepository.findById(command.attemptId);
  if (!attempt || attempt.userId !== context.userId) {
    failOwnership('Attempt', command.attemptId); // 404 to hide existence
  }

  // Create Submission
  const submission = await submissionRepository.create({
    attemptId: command.attemptId,
    activityId: command.activityId,
    type: command.type,
    audioUrl: command.audioUrl,
    text: command.answer || '', // Use answer as text if provided, otherwise empty string
    answer: command.answer,
  });

  // Emit event - IDs-only payload (no score/cefrLevel)
  await context.eventEmitter.emit({
    eventName: 'learning.submission.created',
    payload: {
      eventId: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
      correlationId: command.correlationId,
      submissionId: submission.id,
      attemptId: command.attemptId,
      // userId is NOT in payload - must be read from Attempt entity per STEP 5C
    },
  });

  return { submissionId: submission.id };
}
