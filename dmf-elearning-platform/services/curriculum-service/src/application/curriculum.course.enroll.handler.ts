/**
 * Command handler: curriculum.course.enroll (Bộ xử lý lệnh: Ghi danh khóa học)
 */

import type { CurriculumCourseEnrollCommand } from '@dmf/contracts';
import type { EnrollmentRepository } from '../state/enrollment.repository';
import type { EventBus, IdempotencyStore, Outbox } from '@dmf/infra';
import { forbidRole, makeNotFound, makeConflict, UserRole } from '@dmf/shared';
import { makeIdempotencyKey, makeNaturalKey } from '@dmf/infra';
import { emitViaOutbox } from '@dmf/infra/adapters';

export interface CurriculumCourseEnrollContext {
  userId: string;
  role: string;
}

export async function handleCurriculumCourseEnroll(
  command: CurriculumCourseEnrollCommand,
  context: CurriculumCourseEnrollContext,
  deps: {
    enrollmentRepository: EnrollmentRepository;
    eventBus: EventBus;
    idempotencyStore: IdempotencyStore;
    outbox: Outbox;
  }
) {
  // 1. Authz check (Kiểm tra phân quyền)
  // Cast role to UserRole at boundary (Ép kiểu role thành UserRole tại ranh giới)
  const role = context.role as UserRole;
  forbidRole(role, [UserRole.LEARNER]);

  // 2. Ownership check (Kiểm tra sở hữu)
  if (command.userId !== context.userId) {
    // Hide existence: return NotFound (per STEP 8B) (Ẩn sự tồn tại: trả về NotFound)
    const notFoundError = makeNotFound('Enrollment');
    const error = new Error(notFoundError.message);
    (error as any).standardError = notFoundError;
    throw error;
  }

  // 3. Idempotency check (Kiểm tra idempotency)
  if (command.correlationId) {
    const idempotencyKey = makeIdempotencyKey('curriculum.course.enroll', command.correlationId);
    const existingResult = await deps.idempotencyStore.get(idempotencyKey);
    if (existingResult) {
      // Idempotent replay: return same result, do NOT emit event (Phát lại idempotent: trả về kết quả cũ, KHÔNG phát sự kiện)
      return {
        id: existingResult.resultIds.enrollmentId,
        userId: command.userId,
        courseId: command.courseId,
        enrolledAt: new Date(existingResult.timestamp),
        replayed: true,
      };
    }
  }

  // 4. Check if already enrolled (natural key) (Kiểm tra đã ghi danh - khóa tự nhiên)
  const existing = await deps.enrollmentRepository.findByUserAndCourse(
    command.userId,
    command.courseId
  );
  if (existing) {
    // If no correlationId, this is a conflict (Nếu không có correlationId, đây là conflict)
    if (!command.correlationId) {
      const conflictError = makeConflict('Already enrolled');
      const error = new Error(conflictError.message);
      (error as any).standardError = conflictError;
      throw error;
    }
    // If correlationId exists but enrollment exists, check if it's from same correlationId
    // (Nếu correlationId tồn tại nhưng enrollment đã tồn tại, kiểm tra xem có phải từ cùng correlationId)
    const naturalKey = makeNaturalKey('enrollment', command.userId, command.courseId);
    const naturalKeyResult = await deps.idempotencyStore.get(naturalKey);
    if (naturalKeyResult && naturalKeyResult.resultIds.enrollmentId === existing.id) {
      // Same enrollment from previous request (Cùng enrollment từ yêu cầu trước)
      return { ...existing, replayed: true };
    }
    // Different correlationId, conflict (Khác correlationId, conflict)
    const conflictError = makeConflict('Already enrolled');
    const error = new Error(conflictError.message);
    (error as any).standardError = conflictError;
    throw error;
  }

  // 4. Create Enrollment (Tạo Enrollment)
  const enrollmentId = `enrollment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as any;
  const enrollment = await deps.enrollmentRepository.create({
    id: enrollmentId,
    userId: command.userId,
    courseId: command.courseId,
    enrolledAt: new Date(),
  });

  // 5. Emit event via outbox (write-then-emit safety) (Phát sự kiện qua outbox - an toàn ghi rồi mới phát)
  const eventId = generateEventId();
  const commandKey = command.correlationId || makeNaturalKey('enrollment', command.userId, command.courseId);
  await emitViaOutbox(
    {
      eventName: 'curriculum.course.enrolled',
      payload: {
        eventId,
        occurredAt: new Date().toISOString(),
        correlationId: command.correlationId,
        enrollmentId: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
      },
    },
    deps.eventBus,
    deps.outbox,
    commandKey
  );

  // 6. Store idempotency result (Lưu kết quả idempotency)
  if (command.correlationId) {
    const idempotencyKey = makeIdempotencyKey('curriculum.course.enroll', command.correlationId);
    await deps.idempotencyStore.set(idempotencyKey, {
      resultIds: { enrollmentId: enrollment.id },
      emittedEventIds: [eventId],
      timestamp: new Date().toISOString(),
    });
  }

  // Also store natural key (userId + courseId) (Cũng lưu khóa tự nhiên - userId + courseId)
  const naturalKey = makeNaturalKey('enrollment', command.userId, command.courseId);
  await deps.idempotencyStore.set(naturalKey, {
    resultIds: { enrollmentId: enrollment.id },
    emittedEventIds: [eventId],
    timestamp: enrollment.enrolledAt.toISOString(),
  });

  return enrollment;
}

function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
