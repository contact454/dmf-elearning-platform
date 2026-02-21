/**
 * Consumer: curriculum.course.enrolled.
 * Ensures MasteryState exists for user (getOrCreate). Dedupe by eventId.
 */

import type { Event } from '@dmf/infra';
import type { Logger } from '@dmf/infra';
import type { UserId } from '@dmf/shared';
import type { MasteryStateRepository } from '../../state/in-memory-mastery.repository.js';
import { hasProcessedEvent, markProcessedEvent } from '../../state/processed-events.store.js';

export interface CourseEnrolledDeps {
  masteryRepo: MasteryStateRepository;
  logger: Logger;
}

export async function handleCurriculumCourseEnrolled(
  event: Event,
  deps: CourseEnrolledDeps
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
  if (!userId) {
    deps.logger.warn('curriculum.course.enrolled missing userId', { eventId });
    return;
  }

  await deps.masteryRepo.getOrCreate(userId);
  deps.logger.info('MasteryState ensured for enrollment', { userId, eventId });
}
