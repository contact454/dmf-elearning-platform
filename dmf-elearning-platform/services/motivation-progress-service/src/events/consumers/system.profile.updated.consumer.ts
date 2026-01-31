/**
 * Consumer: system.profile.updated.
 * Resets MasteryState/SkillScore (version bump). Only if learningLanguage changed (MVP: always reset).
 * Dedupe by eventId.
 */

import type { Event } from '@dmf/infra';
import type { Logger } from '@dmf/infra';
import type { UserId } from '@dmf/shared';
import type { MasteryStateRepository } from '../../state/in-memory-mastery.repository.js';
import type { SkillScoreRepository } from '../../state/in-memory-skillscore.repository.js';
import { hasProcessedEvent, markProcessedEvent } from '../../state/processed-events.store.js';
import { createEmptyMasteryState } from '../../state/models.js';

export interface ProfileUpdatedDeps {
  masteryRepo: MasteryStateRepository;
  skillScoreRepo: SkillScoreRepository;
  logger: Logger;
}

export async function handleSystemProfileUpdated(
  event: Event,
  deps: ProfileUpdatedDeps
): Promise<void> {
  const eventId = (event.payload as { eventId?: string }).eventId ?? '';
  if (hasProcessedEvent(eventId)) {
    deps.logger.info('Duplicate event skipped (system.profile.updated)', { eventId });
    return;
  }
  markProcessedEvent(eventId);

  const userId = (event.payload as { userId?: string }).userId as UserId;
  if (!userId) {
    deps.logger.warn('system.profile.updated missing userId', { eventId });
    return;
  }

  const existing = await deps.masteryRepo.findByUserId(userId);
  const next = createEmptyMasteryState(userId);
  if (existing) next.version = existing.version + 1;
  await deps.masteryRepo.save(next);

  const scores = await deps.skillScoreRepo.findByUserId(userId);
  for (const ss of scores) {
    ss.scoreVal = 0;
    ss.evidenceCount = 0;
    ss.lastUpdatedAt = new Date().toISOString();
    await deps.skillScoreRepo.save(ss);
  }

  deps.logger.info('MasteryState and SkillScore reset for profile update', { userId, eventId });
}
