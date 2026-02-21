/**
 * M3 smoke: in-process event chain + assertions for progress/mastery consumers.
 */

import {
  sharedEventBus,
  InMemoryEventBus,
  InMemoryLogger,
} from '../packages/infra/src/adapters/index.js';
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

async function emit(
  eventName: string,
  payload: Record<string, unknown>,
  eventId: string = uuid()
): Promise<void> {
  await sharedEventBus.emit({
    eventName: eventName as any,
    payload: {
      eventId,
      occurredAt: new Date().toISOString(),
      ...payload,
    },
  });
}

async function main(): Promise<void> {
  console.log('M3 smoke: clearing stores and wiring consumers...');

  if (sharedEventBus instanceof InMemoryEventBus) {
    sharedEventBus.clearProcessedEvents();
  }
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

  console.log('M3 smoke: emitting event chain...');
  await emit('system.user.registered', { userId });
  await emit('curriculum.course.enrolled', { userId, courseId });

  const lessonCompletedEventId = uuid();
  await emit('learning.lesson.completed', { userId, lessonId, attemptId, score: 0.85 }, lessonCompletedEventId);
  await emit('learning.lesson.completed', { userId, lessonId, attemptId, score: 0.85 }, lessonCompletedEventId);

  await emit('learning.submission.created', {
    userId,
    lessonId,
    attemptId,
    submissionId,
    type: 'text',
  });
  await emit('assessment.quiz.submitted', { userId, assessmentId, score: 0.78 });

  await new Promise((r) => setTimeout(r, 50));

  const progress = await progressRepo.findByUserId(userId as import('@dmf/shared').UserId);
  const masteryBeforeProfile = await masteryRepo.findByUserId(userId as import('@dmf/shared').UserId);

  if (!progress) {
    console.error('FAIL: progress state missing');
    process.exit(1);
  }
  if (!masteryBeforeProfile) {
    console.error('FAIL: mastery state missing');
    process.exit(1);
  }
  if (!progress.completedLessons.includes(lessonId as import('@dmf/shared').LessonId)) {
    console.error('FAIL: progress.completedLessons should include lessonId', progress.completedLessons);
    process.exit(1);
  }
  if (progress.completedLessons.length !== 1) {
    console.error('FAIL: duplicate lesson.completed should be deduped by eventId', progress.completedLessons);
    process.exit(1);
  }
  if (progress.currentCourseId !== (courseId as import('@dmf/shared').CourseId)) {
    console.error('FAIL: progress.currentCourseId mismatch', progress.currentCourseId);
    process.exit(1);
  }

  const lessonMasteryBefore = masteryBeforeProfile.lessonMastery[lessonId as import('@dmf/shared').LessonId];
  if (!lessonMasteryBefore || lessonMasteryBefore.overallScore < 0.7) {
    console.error('FAIL: lesson mastery should be >= 0.7 after lesson completion', lessonMasteryBefore);
    process.exit(1);
  }

  await emit('system.profile.updated', {
    userId,
    learningLanguageChanged: false,
    previousLearningLanguage: 'en',
    learningLanguage: 'en',
  });
  await new Promise((r) => setTimeout(r, 25));

  const masteryAfterNoLanguageChange = await masteryRepo.findByUserId(userId as import('@dmf/shared').UserId);
  if (!masteryAfterNoLanguageChange) {
    console.error('FAIL: mastery state missing after no-op profile update');
    process.exit(1);
  }
  if (!masteryAfterNoLanguageChange.lessonMastery[lessonId as import('@dmf/shared').LessonId]) {
    console.error('FAIL: mastery should not reset when learningLanguage unchanged');
    process.exit(1);
  }

  await emit('system.profile.updated', {
    userId,
    learningLanguageChanged: true,
    previousLearningLanguage: 'en',
    learningLanguage: 'de',
  });
  await new Promise((r) => setTimeout(r, 25));

  const masteryAfterLanguageChange = await masteryRepo.findByUserId(userId as import('@dmf/shared').UserId);
  if (!masteryAfterLanguageChange) {
    console.error('FAIL: mastery state missing after language-change profile update');
    process.exit(1);
  }
  if (Object.keys(masteryAfterLanguageChange.lessonMastery).length !== 0) {
    console.error('FAIL: mastery should reset when learningLanguage changes', masteryAfterLanguageChange.lessonMastery);
    process.exit(1);
  }

  console.log('PASS: progress + mastery consumers/read-state behavior verified');
  process.exit(0);
}

main().catch((error) => {
  console.error('M3 smoke error:', error);
  process.exit(1);
});
