/**
 * Consumer: assessment.quiz.submitted.
 * Updates SkillScore from quiz score. Dedupe by eventId. Payload score 0–1 or 0–100.
 */

import type { Event } from '@dmf/infra';
import type { Logger } from '@dmf/infra';
import type { UserId } from '@dmf/shared';
import type { MasteryStateRepository } from '../../state/in-memory-mastery.repository.js';
import type { SkillScoreRepository } from '../../state/in-memory-skillscore.repository.js';
import { hasProcessedEvent, markProcessedEvent } from '../../state/processed-events.store.js';
import type { SkillType } from '../../state/models.js';

export interface QuizSubmittedDeps {
  masteryRepo: MasteryStateRepository;
  skillScoreRepo: SkillScoreRepository;
  logger: Logger;
}

const QUIZ_SKILLS: SkillType[] = [
  'listening', 'reading', 'speaking', 'writing', 'grammar', 'vocabulary',
];

export async function handleAssessmentQuizSubmitted(
  event: Event,
  deps: QuizSubmittedDeps
): Promise<void> {
  const eventId = (event.payload as { eventId?: string }).eventId ?? '';
  if (eventId && hasProcessedEvent(eventId)) {
    deps.logger.info('Duplicate event skipped (assessment.quiz.submitted)', { eventId });
    return;
  }
  if (eventId) {
    markProcessedEvent(eventId);
  } else {
    deps.logger.warn('assessment.quiz.submitted missing eventId; processing without dedupe', {});
  }

  const userId = (event.payload as { userId?: string }).userId as UserId;
  let rawScore = (event.payload as { score?: number }).score;
  if (!userId) {
    deps.logger.warn('assessment.quiz.submitted missing userId', { eventId });
    return;
  }

  const score = typeof rawScore === 'number' && rawScore >= 0 && rawScore <= 1
    ? rawScore
    : typeof rawScore === 'number' && rawScore > 1
      ? Math.min(1, rawScore / 100)
      : 0.5;

  const inc = score / QUIZ_SKILLS.length;
  const state = await deps.masteryRepo.getOrCreate(userId);

  for (const skill of QUIZ_SKILLS) {
    state.skillBreakdown[skill] = Math.min(1, (state.skillBreakdown[skill] ?? 0) + inc);
    let ss = await deps.skillScoreRepo.findByUserIdAndSkill(userId, skill);
    if (!ss) {
      ss = {
        userId,
        skillType: skill,
        scoreVal: 0,
        evidenceCount: 0,
        lastUpdatedAt: new Date().toISOString(),
      };
      await deps.skillScoreRepo.create(ss);
    }
    ss.scoreVal = Math.min(1, ss.scoreVal + inc);
    ss.evidenceCount += 1;
    ss.lastUpdatedAt = new Date().toISOString();
    await deps.skillScoreRepo.save(ss);
  }

  const skillVals = QUIZ_SKILLS.map((s) => state.skillBreakdown[s] ?? 0);
  state.overallScore = skillVals.reduce((a, b) => a + b, 0) / skillVals.length;
  state.updatedAt = new Date().toISOString();
  await deps.masteryRepo.save(state);

  deps.logger.info('MasteryState updated for quiz', { userId, eventId, score });
}
