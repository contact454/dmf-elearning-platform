/**
 * Command handler: assessment.quiz.start (Bộ xử lý lệnh: Bắt đầu bài kiểm tra)
 */

import type { AssessmentQuizStartCommand } from '@dmf/contracts';
import type { AssessmentRepository } from '../state/assessment.repository';
import type { EventBus, IdempotencyStore, Outbox } from '@dmf/infra';
import { forbidRole, makeNotFound } from '@dmf/shared';
import { makeIdempotencyKey } from '@dmf/infra';
import { emitViaOutbox } from '@dmf/infra/adapters';
import { v4 as uuid } from 'uuid';
import { assessmentQuizStartedSchema } from '@dmf/contracts';

export interface AssessmentQuizStartContext {
  userId: string;
  role: string;
}

export async function handleAssessmentQuizStart(
  command: AssessmentQuizStartCommand,
  context: AssessmentQuizStartContext,
  deps: {
    assessmentRepository: AssessmentRepository;
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
    const notFoundError = makeNotFound('Assessment');
    const error = new Error(notFoundError.message);
    (error as any).standardError = notFoundError;
    throw error;
  }

  // 3. Idempotency check (Kiểm tra idempotency)
  if (command.correlationId) {
    const idempotencyKey = makeIdempotencyKey('assessment.quiz.start', command.correlationId);
    const existingResult = await deps.idempotencyStore.get(idempotencyKey);
    if (existingResult) {
      // Idempotent replay: return same result, do NOT emit event (Phát lại idempotent: trả về kết quả cũ, KHÔNG phát sự kiện)
      const assessment = await deps.assessmentRepository.findById(existingResult.resultIds.assessmentId as any);
      if (assessment) {
        return { ...assessment, replayed: true };
      }
    }
  }

  // 4. Create Assessment (Tạo Assessment)
  const assessment = await deps.assessmentRepository.create({
    userId: command.userId,
    quizId: command.quizId,
    status: 'in-progress',
    startedAt: new Date(),
  });

  // 5. Emit event (IDs-only) (Phát sự kiện - chỉ ID)
  const eventId = uuid();
  const event = assessmentQuizStartedSchema.parse({
    eventName: 'assessment.quiz.started',
    payload: {
      eventId,
      occurredAt: new Date().toISOString(),
      correlationId: command.correlationId,
      assessmentId: assessment.id,
      userId: assessment.userId,
      attemptId: undefined, // Optional, not implemented for MVP
    },
  });

  await emitViaOutbox(event, deps.eventBus, deps.outbox, command.correlationId ? `assessment.quiz.start:${command.correlationId}` : undefined);

  // 6. Store idempotency result (Lưu kết quả idempotency)
  if (command.correlationId) {
    const idempotencyKey = makeIdempotencyKey('assessment.quiz.start', command.correlationId);
    await deps.idempotencyStore.set(idempotencyKey, {
      resultIds: { assessmentId: assessment.id },
      emittedEventIds: [eventId],
      timestamp: new Date().toISOString(),
    });
  }

  return assessment;
}
