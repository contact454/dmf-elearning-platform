/**
 * Consumer: system.profile.updated.
 * Resets MasteryState/SkillScore only when learningLanguage changes.
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
  if (eventId && hasProcessedEvent(eventId)) {
    deps.logger.info('Duplicate event skipped (system.profile.updated)', { eventId });
    return;
  }
  if (eventId) {
    markProcessedEvent(eventId);
  } else {
    deps.logger.warn('system.profile.updated missing eventId; processing without dedupe', {});
  }

  const payload = event.payload as {
    userId?: string;
    learningLanguageChanged?: boolean;
    previousLearningLanguage?: string;
    learningLanguage?: string;
  };
  const userId = payload.userId as UserId;
  if (!userId) {
    deps.logger.warn('system.profile.updated missing userId', { eventId });
    return;
  }

  const inferredChange =
    payload.previousLearningLanguage !== undefined &&
    payload.learningLanguage !== undefined &&
    payload.previousLearningLanguage !== payload.learningLanguage;
  const learningLanguageChanged = payload.learningLanguageChanged ?? inferredChange;
  if (!learningLanguageChanged) {
    deps.logger.info('Mastery reset skipped: learningLanguage unchanged', { userId, eventId });
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
