/**
 * Event consumer: learning.lesson.started
 * Optional tracking; we mainly care about completion. Dedupe by eventId.
 */

import type { Event } from '@dmf/infra';
import type { Logger } from '@dmf/infra';
import type { UserId, LessonId, AttemptId } from '@dmf/shared';
import type { ProgressStateRepository } from '../../state/in-memory-progress.repository.js';
import { hasProcessedEvent, markProcessedEvent } from '../../state/processed-events.store.js';

export async function handleLearningLessonStarted(
  event: Event,
  deps: { progressRepo: ProgressStateRepository; logger: Logger }
): Promise<void> {
  const eventId = (event.payload as { eventId?: string }).eventId ?? '';

  if (eventId && hasProcessedEvent(eventId)) {
    deps.logger.info('Duplicate event skipped (learning.lesson.started)', { eventId });
    return;
  }
  if (eventId) {
    markProcessedEvent(eventId);
  } else {
    deps.logger.warn('learning.lesson.started missing eventId; processing without dedupe', {});
  }

  const userId = (event.payload as { userId?: string }).userId as UserId;
  const lessonId = (event.payload as { lessonId?: string }).lessonId as LessonId;
  const attemptId = (event.payload as { attemptId?: string }).attemptId as AttemptId;
  if (!userId) {
    deps.logger.warn('learning.lesson.started missing userId', { eventId });
    return;
  }

  let state = await deps.progressRepo.findByUserId(userId);
  if (!state) state = await deps.progressRepo.getOrCreate(userId);

  await deps.progressRepo.update(userId, { updatedAt: new Date() });

  deps.logger.info('ProgressState updated for lesson start', {
    userId,
    lessonId: lessonId ?? '',
    attemptId: attemptId ?? '',
    eventId,
  });
}
