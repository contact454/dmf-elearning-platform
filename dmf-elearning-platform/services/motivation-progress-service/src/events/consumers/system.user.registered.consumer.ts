/**
 * Consumer: system.user.registered.
 * Initializes MasteryState for new user. Dedupe by eventId.
 */

import type { Event } from '@dmf/infra';
import type { Logger } from '@dmf/infra';
import type { UserId } from '@dmf/shared';
import type { MasteryStateRepository } from '../../state/in-memory-mastery.repository.js';
import { hasProcessedEvent, markProcessedEvent } from '../../state/processed-events.store.js';
import { createEmptyMasteryState } from '../../state/models.js';

export interface UserRegisteredDeps {
  masteryRepo: MasteryStateRepository;
  logger: Logger;
}

export async function handleSystemUserRegistered(
  event: Event,
  deps: UserRegisteredDeps
): Promise<void> {
  const eventId = (event.payload as { eventId?: string }).eventId ?? '';
  if (hasProcessedEvent(eventId)) {
    deps.logger.info('Duplicate event skipped (system.user.registered)', { eventId });
    return;
  }
  markProcessedEvent(eventId);

  const userId = (event.payload as { userId?: string }).userId as UserId;
  if (!userId) {
    deps.logger.warn('system.user.registered missing userId', { eventId });
    return;
  }

  await deps.masteryRepo.create(createEmptyMasteryState(userId));
  deps.logger.info('MasteryState initialized', { userId, eventId });
}
