/**
 * Event consumer: curriculum.course.enrolled
 * Sets currentCourseId on ProgressState. Dedupe by eventId; log duplicate gently.
 */

import type { Event } from '@dmf/infra';
import type { Logger } from '@dmf/infra';
import type { UserId, CourseId } from '@dmf/shared';
import type { ProgressStateRepository } from '../../state/in-memory-progress.repository.js';
import { hasProcessedEvent, markProcessedEvent } from '../../state/processed-events.store.js';

export async function handleCurriculumCourseEnrolled(
  event: Event,
  deps: { progressRepo: ProgressStateRepository; logger: Logger }
): Promise<void> {
  const eventId = (event.payload as { eventId?: string }).eventId ?? '';

  if (eventId && hasProcessedEvent(eventId)) {
    deps.logger.info('Duplicate event skipped (curriculum.course.enrolled)', { eventId });
    return;
  }
  if (eventId) {
    markProcessedEvent(eventId);
  } else {
    deps.logger.warn('curriculum.course.enrolled missing eventId; processing without dedupe', {});
  }

  const userId = (event.payload as { userId?: string }).userId as UserId;
  const courseId = (event.payload as { courseId?: string }).courseId as CourseId;
  if (!userId || !courseId) {
    deps.logger.warn('curriculum.course.enrolled missing userId or courseId', { eventId });
    return;
  }

  let state = await deps.progressRepo.findByUserId(userId);
  if (!state) state = await deps.progressRepo.getOrCreate(userId);

  await deps.progressRepo.update(userId, {
    currentCourseId: courseId,
    updatedAt: new Date(),
  });

  deps.logger.info('ProgressState updated for enrollment', { userId, courseId, eventId });
}
