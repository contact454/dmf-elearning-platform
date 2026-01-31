/**
 * Command handler: assessment.quiz.submit (Bộ xử lý lệnh: Nộp bài kiểm tra)
 */

import type { AssessmentQuizSubmitCommand } from '@dmf/contracts';
import type { AssessmentRepository } from '../state/assessment.repository';
import type { EventBus, IdempotencyStore, Outbox } from '@dmf/infra';
import { forbidRole, makeNotFound } from '@dmf/shared';
import { makeIdempotencyKey } from '@dmf/infra';
import { emitViaOutbox } from '@dmf/infra/adapters';
import { v4 as uuid } from 'uuid';
import { assessmentQuizSubmittedSchema } from '@dmf/contracts';

export interface AssessmentQuizSubmitContext {
  userId: string;
  role: string;
}

export async function handleAssessmentQuizSubmit(
  command: AssessmentQuizSubmitCommand,
  context: AssessmentQuizSubmitContext,
  deps: {
    assessmentRepository: AssessmentRepository;
    eventBus: EventBus;
    idempotencyStore: IdempotencyStore;
    outbox: Outbox;
  }
) {
  // 1. Authz check (Kiểm tra phân quyền)
  forbidRole(context.role as any, ['learner']);

  // 2. Load Assessment (Tải Assessment)
  const assessment = await deps.assessmentRepository.findById(command.assessmentId);
  if (!assessment) {
    const notFoundError = makeNotFound('Assessment', command.assessmentId);
    const error = new Error(notFoundError.message);
    (error as any).standardError = notFoundError;
    throw error;
  }

  // 3. Ownership check (Kiểm tra sở hữu)
  if (assessment.userId !== context.userId) {
    // Hide existence: return NotFound (per STEP 8B) (Ẩn sự tồn tại: trả về NotFound)
    const notFoundError = makeNotFound('Assessment');
    const error = new Error(notFoundError.message);
    (error as any).standardError = notFoundError;
    throw error;
  }

  // 4. Idempotency check (Kiểm tra idempotency)
  if (command.correlationId) {
    const idempotencyKey = makeIdempotencyKey('assessment.quiz.submit', command.correlationId, command.assessmentId);
    const existingResult = await deps.idempotencyStore.get(idempotencyKey);
    if (existingResult) {
      // Idempotent replay: return same result, do NOT emit event (Phát lại idempotent: trả về kết quả cũ, KHÔNG phát sự kiện)
      const updatedAssessment = await deps.assessmentRepository.findById(command.assessmentId);
      if (updatedAssessment) {
        return { ...updatedAssessment, replayed: true };
      }
    }
  }

  // 5. Compute score (placeholder, deterministic) (Tính điểm - placeholder, xác định)
  // In real implementation, this would call education/rubric (Trong triển khai thực tế, sẽ gọi education/rubric)
  const score = computeScore(command.answers); // Placeholder computation (Tính toán placeholder)

  // 6. Update Assessment (Cập nhật Assessment)
  const updatedAssessment = await deps.assessmentRepository.update(command.assessmentId, {
    status: 'graded',
    score,
    answers: command.answers,
    submittedAt: new Date(),
  });

  // 7. Emit event (IDs-only, NO score) (Phát sự kiện - chỉ ID, KHÔNG có điểm)
  const eventId = uuid();
  const event = assessmentQuizSubmittedSchema.parse({
    eventName: 'assessment.quiz.submitted',
    payload: {
      eventId,
      occurredAt: new Date().toISOString(),
      correlationId: command.correlationId,
      assessmentId: updatedAssessment.id,
      userId: updatedAssessment.userId,
      // NO score in payload (IDs-only policy) (KHÔNG có điểm trong payload - chính sách chỉ ID)
    },
  });

  await emitViaOutbox(event, deps.eventBus, deps.outbox, command.correlationId ? `assessment.quiz.submit:${command.correlationId}` : undefined);

  // 8. Store idempotency result (Lưu kết quả idempotency)
  if (command.correlationId) {
    const idempotencyKey = makeIdempotencyKey('assessment.quiz.submit', command.correlationId, command.assessmentId);
    await deps.idempotencyStore.set(idempotencyKey, {
      resultIds: { assessmentId: updatedAssessment.id },
      emittedEventIds: [eventId],
      timestamp: new Date().toISOString(),
    });
  }

  return updatedAssessment;
}

/**
 * Compute score (placeholder, deterministic) (Tính điểm - placeholder, xác định)
 * 
 * In real implementation, this would call education/rubric.
 * For MVP: simple deterministic computation based on answer count.
 */
function computeScore(answers: Record<string, unknown>): number {
  // Placeholder: return deterministic score based on answer count (Placeholder: trả về điểm xác định dựa trên số lượng câu trả lời)
  const answerCount = Object.keys(answers).length;
  if (answerCount === 0) return 0;
  // Simple deterministic formula: 50 + (answerCount * 5), capped at 100
  return Math.min(100, 50 + answerCount * 5);
}
