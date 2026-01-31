/**
 * Consumer: mentoring.feedback.published.
 * Updates speaking/writing SkillScore from feedback. Dedupe by eventId.
 */

import type { Event } from '@dmf/infra';
import type { Logger } from '@dmf/infra';
import type { UserId } from '@dmf/shared';
import type { MasteryStateRepository } from '../../state/in-memory-mastery.repository.js';
import type { SkillScoreRepository } from '../../state/in-memory-skillscore.repository.js';
import { hasProcessedEvent, markProcessedEvent } from '../../state/processed-events.store.js';
import type { SkillType } from '../../state/models.js';

export interface FeedbackPublishedDeps {
  masteryRepo: MasteryStateRepository;
  skillScoreRepo: SkillScoreRepository;
  logger: Logger;
}

function authorWeight(author: string): number {
  if (author === 'teacher') return 1;
  if (author === 'mentor') return 0.9;
  if (author === 'ai') return 0.7;
  return 0.7;
}

export async function handleMentoringFeedbackPublished(
  event: Event,
  deps: FeedbackPublishedDeps
): Promise<void> {
  const eventId = (event.payload as { eventId?: string }).eventId ?? '';
  if (hasProcessedEvent(eventId)) {
    deps.logger.info('Duplicate event skipped (mentoring.feedback.published)', { eventId });
    return;
  }
  markProcessedEvent(eventId);

  const userId = (event.payload as { userId?: string }).userId as UserId | undefined;
  const author = (event.payload as { author?: string }).author as string | undefined;
  const submissionType = (event.payload as { submissionType?: string }).submissionType as string | undefined;
  const rawScore = (event.payload as { score?: number }).score;
  if (!userId) {
    deps.logger.warn('mentoring.feedback.published missing userId', { eventId });
    return;
  }

  const skillType: SkillType = submissionType === 'audio' ? 'speaking' : 'writing';
  const s = typeof rawScore === 'number' && rawScore >= 0 && rawScore <= 1
    ? rawScore
    : typeof rawScore === 'number' && rawScore > 1
      ? Math.min(1, rawScore / 100)
      : 0.5;
  const weight = authorWeight(author ?? 'ai');
  const delta = s * weight * 0.15;

  const state = await deps.masteryRepo.getOrCreate(userId);
  state.skillBreakdown[skillType] = Math.min(1, (state.skillBreakdown[skillType] ?? 0) + delta);
  state.updatedAt = new Date().toISOString();
  await deps.masteryRepo.save(state);

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

  deps.logger.info('MasteryState updated for feedback', {
    userId,
    eventId,
    skillType,
    author: author ?? 'unknown',
  });
}
