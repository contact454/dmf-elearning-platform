/**
 * Consumer: learning.lesson.completed.
 * Updates MasteryState + SkillScore. Dedupe by eventId. Apply 0.7 threshold.
 */

import type { Event } from '@dmf/infra';
import type { Logger } from '@dmf/infra';
import type { UserId, LessonId } from '@dmf/shared';
import type { MasteryStateRepository } from '../../state/in-memory-mastery.repository.js';
import type { SkillScoreRepository } from '../../state/in-memory-skillscore.repository.js';
import { hasProcessedEvent, markProcessedEvent } from '../../state/processed-events.store.js';
import { MasteryCalculator } from '../../logic/calculator.js';

export interface LessonCompletedDeps {
  masteryRepo: MasteryStateRepository;
  skillScoreRepo: SkillScoreRepository;
  logger: Logger;
}

export async function handleLearningLessonCompleted(
  event: Event,
  deps: LessonCompletedDeps
): Promise<void> {
  const eventId = (event.payload as { eventId?: string }).eventId ?? '';
  if (hasProcessedEvent(eventId)) {
    deps.logger.info('Duplicate event skipped (learning.lesson.completed)', { eventId });
    return;
  }
  markProcessedEvent(eventId);

  const userId = (event.payload as { userId?: string }).userId as UserId;
  const lessonId = (event.payload as { lessonId?: string }).lessonId as LessonId;
  const rawScore = (event.payload as { score?: number }).score;

  if (!userId || !lessonId) {
    deps.logger.warn('learning.lesson.completed missing userId or lessonId', { eventId });
    return;
  }

  // M3-lite: specific check for smoke test logic
  if (rawScore === undefined) {
    deps.logger.warn('learning.lesson.completed missing score, skipping mastery update', { eventId });
    return;
  }

  // 1. Get or Init State
  const currentState = await deps.masteryRepo.getOrCreate(userId);

  // 2. Calculate New State using Logic Class
  const newState = MasteryCalculator.calculateLessonCompletion(
    currentState,
    lessonId,
    rawScore
  );

  // 3. Save State
  await deps.masteryRepo.save(newState);

  // 4. Update Skill Repo (Mirroring logic from original consumer for backward compat/separate repo)
  // Refactored to just use what Calculator produced
  const skillTypes = ['listening', 'reading', 'speaking', 'writing'] as const;
  for (const skill of skillTypes) {
    const score = newState.skillBreakdown[skill] ?? 0;

    let ss = await deps.skillScoreRepo.findByUserIdAndSkill(userId, skill);
    if (!ss) {
      ss = {
        userId,
        skillType: skill,
        scoreVal: 0,
        evidenceCount: 0,
        lastUpdatedAt: new Date().toISOString()
      };
      await deps.skillScoreRepo.create(ss);
    }
    ss.scoreVal = score;
    ss.evidenceCount += 1;
    ss.lastUpdatedAt = newState.updatedAt;
    await deps.skillScoreRepo.save(ss);
  }

  deps.logger.info('MasteryState updated via Calculator', {
    userId,
    lessonId,
    overallScore: newState.lessonMastery[lessonId].overallScore,
    newVersion: newState.version
  });
}
