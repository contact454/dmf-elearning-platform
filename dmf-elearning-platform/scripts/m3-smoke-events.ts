/**
 * M3 smoke: emit minimal event chain (user.registered → course.enrolled → lesson.completed
 * → submission.created → quiz.submitted), then assert progress + mastery state.
 *
 * In-process only: sharedEventBus + progress & motivation consumers + stores.
 * Run: pnpm exec tsx scripts/m3-smoke-events.ts
 */

import { sharedEventBus } from '@dmf/infra/adapters';
import { InMemoryLogger } from '@dmf/infra/adapters';
import { createInMemoryProgressRepository } from '../services/progress-service/src/state/in-memory-progress.repository.js';
import { clearProgressStore } from '../services/progress-service/src/state/progress-state.store.js';
import { clearProcessedEvents as clearProgressProcessed } from '../services/progress-service/src/state/processed-events.store.js';
import { setupEventConsumers as setupProgressConsumers } from '../services/progress-service/src/events/consumers/index.js';
import { createInMemoryMasteryRepository } from '../services/motivation-progress-service/src/state/in-memory-mastery.repository.js';
import { createInMemorySkillScoreRepository } from '../services/motivation-progress-service/src/state/in-memory-skillscore.repository.js';
import { clearMasteryStore } from '../services/motivation-progress-service/src/state/mastery.store.js';
import { clearSkillScoreStore } from '../services/motivation-progress-service/src/state/skillscore.store.js';
import { clearProcessedEvents as clearMotivationProcessed } from '../services/motivation-progress-service/src/state/processed-events.store.js';
import { setupEventConsumers as setupMotivationConsumers } from '../services/motivation-progress-service/src/events/consumers/index.js';

const userId = 'm3-smoke-user';
const courseId = 'm3-smoke-course';
const lessonId = 'm3-smoke-lesson';
const attemptId = 'm3-smoke-attempt';
const submissionId = 'm3-smoke-submission';
const assessmentId = 'm3-smoke-assessment';

function uuid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function emit(name: string, payload: Record<string, unknown>): Promise<void> {
  const event = {
    eventName: name,
    payload: {
      eventId: uuid(),
      occurredAt: new Date().toISOString(),
      ...payload,
    },
  };
  await sharedEventBus.emit(event as import('@dmf/infra').Event);
}

async function main(): Promise<void> {
  console.log('M3 smoke: clearing stores and setting up consumers...');

  clearProgressStore();
  clearProgressProcessed();
  clearMasteryStore();
  clearSkillScoreStore();
  clearMotivationProcessed();

  const logger = new InMemoryLogger();
  const progressRepo = createInMemoryProgressRepository();
  const masteryRepo = createInMemoryMasteryRepository();
  const skillScoreRepo = createInMemorySkillScoreRepository();

  setupProgressConsumers(sharedEventBus, { progressRepo, logger });
  setupMotivationConsumers(sharedEventBus, { masteryRepo, skillScoreRepo, logger });

  console.log('Emitting event chain...');

  await emit('system.user.registered', { userId });
  await emit('curriculum.course.enrolled', { userId, courseId });
  await emit('learning.lesson.completed', { userId, lessonId, attemptId, score: 0.85 });
  await emit('learning.submission.created', {
    userId,
    lessonId,
    attemptId,
    submissionId,
    type: 'text',
  });
  await emit('assessment.quiz.submitted', { userId, assessmentId, score: 0.78 });

  await new Promise((r) => setTimeout(r, 100));

  const progress = await progressRepo.findByUserId(userId as import('@dmf/shared').UserId);
  const mastery = await masteryRepo.findByUserId(userId as import('@dmf/shared').UserId);

  if (!progress) {
    console.error('FAIL: progress state missing');
    process.exit(1);
  }
  if (!mastery) {
    console.error('FAIL: mastery state missing');
    process.exit(1);
  }

  if (!progress.completedLessons.includes(lessonId)) {
    console.error('FAIL: progress.completedLessons should include', lessonId, progress.completedLessons);
    process.exit(1);
  }
  if (progress.currentCourseId !== courseId) {
    console.error('FAIL: progress.currentCourseId expected', courseId, 'got', progress.currentCourseId);
    process.exit(1);
  }

  const lessonM = mastery.lessonMastery[lessonId];
  if (!lessonM || lessonM.overallScore < 0.7) {
    console.error('FAIL: mastery.lessonMastery[lessonId] expected overallScore >= 0.7', lessonM);
    process.exit(1);
  }

  console.log('PASS: progress + mastery updated correctly');
  console.log('  progress.completedLessons:', progress.completedLessons.length);
  console.log('  mastery.overallScore:', mastery.overallScore);
  process.exit(0);
}

main().catch((e) => {
  console.error('M3 smoke error:', e);
  process.exit(1);
});
