/**
 * Event consumer: system.user.registered
 * Initializes ProgressState for new user.
 * Dedupe by eventId; log duplicate gently, no panic.
 */

import type { Event } from '@dmf/infra';
import type { Logger } from '@dmf/infra';
import type { UserId } from '@dmf/shared';
import type { ProgressStateRepository } from '../../state/in-memory-progress.repository.js';
import { hasProcessedEvent, markProcessedEvent } from '../../state/processed-events.store.js';

export async function handleSystemUserRegistered(
  event: Event,
  deps: { progressRepo: ProgressStateRepository; logger: Logger }
): Promise<void> {
  const eventId = (event.payload as { eventId?: string }).eventId ?? '';

  if (eventId && hasProcessedEvent(eventId)) {
    deps.logger.info('Duplicate event skipped (system.user.registered)', { eventId });
    return;
  }
  if (eventId) {
    markProcessedEvent(eventId);
  } else {
    deps.logger.warn('system.user.registered missing eventId; processing without dedupe', {});
  }

  const userId = (event.payload as { userId?: string }).userId as UserId;
  if (!userId) {
    deps.logger.warn('system.user.registered missing userId', { eventId });
    return;
  }

  await deps.progressRepo.create({
    userId,
    completedLessons: [],
    unlockedLessons: [],
    unlockedUnits: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  deps.logger.info('ProgressState initialized', { userId, eventId });
}
