/**
 * Event consumer: learning.lesson.completed
 * Appends lesson to completedLessons. Unit unlock emit is BLOCKER (needs curriculum API).
 * Dedupe by eventId; log duplicate gently.
 */

import type { Event } from '@dmf/infra';
import type { Logger } from '@dmf/infra';
import type { UserId, LessonId } from '@dmf/shared';
import type { ProgressStateRepository } from '../../state/in-memory-progress.repository.js';
import { hasProcessedEvent, markProcessedEvent } from '../../state/processed-events.store.js';

export async function handleLearningLessonCompleted(
  event: Event,
  deps: { progressRepo: ProgressStateRepository; logger: Logger }
): Promise<void> {
  const eventId = (event.payload as { eventId?: string }).eventId ?? '';

  if (eventId && hasProcessedEvent(eventId)) {
    deps.logger.info('Duplicate event skipped (learning.lesson.completed)', { eventId });
    return;
  }
  if (eventId) {
    markProcessedEvent(eventId);
  } else {
    deps.logger.warn('learning.lesson.completed missing eventId; processing without dedupe', {});
  }

  const userId = (event.payload as { userId?: string }).userId as UserId;
  const lessonId = (event.payload as { lessonId?: string }).lessonId as LessonId;
  if (!userId || !lessonId) {
    deps.logger.warn('learning.lesson.completed missing userId or lessonId', { eventId });
    return;
  }

  let state = await deps.progressRepo.findByUserId(userId);
  if (!state) state = await deps.progressRepo.getOrCreate(userId);

  const completedLessons = [...(state.completedLessons ?? []), lessonId];
  await deps.progressRepo.update(userId, { completedLessons, updatedAt: new Date() });

  deps.logger.info('ProgressState updated for lesson completion', { userId, lessonId, eventId });
}
