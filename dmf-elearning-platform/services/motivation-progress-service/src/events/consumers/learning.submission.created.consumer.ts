/**
 * Consumer: learning.submission.created.
 * Updates lessonMastery evidence + SkillScore by submission type. Dedupe by eventId.
 */

import type { Event } from '@dmf/infra';
import type { Logger } from '@dmf/infra';
import type { UserId, LessonId } from '@dmf/shared';
import type { MasteryStateRepository } from '../../state/in-memory-mastery.repository.js';
import type { SkillScoreRepository } from '../../state/in-memory-skillscore.repository.js';
import { hasProcessedEvent, markProcessedEvent } from '../../state/processed-events.store.js';
import type { SkillType } from '../../state/models.js';

export interface SubmissionCreatedDeps {
  masteryRepo: MasteryStateRepository;
  skillScoreRepo: SkillScoreRepository;
  logger: Logger;
}

function submissionTypeToSkill(type: string): SkillType | null {
  if (type === 'text' || type === 'writing') return 'writing';
  if (type === 'audio' || type === 'speaking') return 'speaking';
  return null;
}

export async function handleLearningSubmissionCreated(
  event: Event,
  deps: SubmissionCreatedDeps
): Promise<void> {
  const eventId = (event.payload as { eventId?: string }).eventId ?? '';
  if (eventId && hasProcessedEvent(eventId)) {
    deps.logger.info('Duplicate event skipped (learning.submission.created)', { eventId });
    return;
  }
  if (eventId) {
    markProcessedEvent(eventId);
  } else {
    deps.logger.warn('learning.submission.created missing eventId; processing without dedupe', {});
  }

  const userId = (event.payload as { userId?: string }).userId as UserId | undefined;
  const lessonId = (event.payload as { lessonId?: string }).lessonId as LessonId;
  const type = (event.payload as { type?: string }).type as string | undefined;
  if (!userId || !lessonId) {
    deps.logger.warn('learning.submission.created missing userId or lessonId', { eventId });
    return;
  }

  const skillType = type ? submissionTypeToSkill(type) : null;
  const state = await deps.masteryRepo.getOrCreate(userId);

  const existing = state.lessonMastery[lessonId];
  state.lessonMastery[lessonId] = {
    evidenceCount: (existing?.evidenceCount ?? 0) + 1,
    lastUpdatedAt: new Date().toISOString(),
    overallScore: existing?.overallScore ?? 0.5,
  };

  if (skillType) {
    const delta = 0.05;
    state.skillBreakdown[skillType] = Math.min(1, (state.skillBreakdown[skillType] ?? 0) + delta);
    let ss = await deps.skillScoreRepo.findByUserIdAndSkill(userId, skillType);
    if (!ss) {
      ss = {
        userId,
        skillType,
        scoreVal: 0,
        evidenceCount: 0,
        lastUpdatedAt: new Date().toISOString(),
      };
      await deps.skillScoreRepo.create(ss);
    }
    ss.scoreVal = Math.min(1, ss.scoreVal + delta);
    ss.evidenceCount += 1;
    ss.lastUpdatedAt = new Date().toISOString();
    await deps.skillScoreRepo.save(ss);
  }

  const lessonScores = Object.values(state.lessonMastery).map((m) => m.overallScore);
  state.overallScore = lessonScores.length
    ? lessonScores.reduce((a, b) => a + b, 0) / lessonScores.length
    : 0;
  state.updatedAt = new Date().toISOString();
  await deps.masteryRepo.save(state);

  deps.logger.info('MasteryState updated for submission', {
    userId,
    lessonId,
    eventId,
    skillType: skillType ?? 'unknown',
  });
}
