/**
 * Event consumers setup for motivation-progress-service.
 * Uses in-memory MasteryState + SkillScore repositories, processed-events dedupe.
 */

import type { EventBus, Logger } from '@dmf/infra';
import type { MasteryStateRepository } from '../../state/in-memory-mastery.repository.js';
import type { SkillScoreRepository } from '../../state/in-memory-skillscore.repository.js';
import { handleSystemUserRegistered } from './system.user.registered.consumer.js';
import { handleCurriculumCourseEnrolled } from './curriculum.course.enrolled.consumer.js';
import { handleLearningLessonCompleted } from './learning.lesson.completed.consumer.js';
import { handleLearningSubmissionCreated } from './learning.submission.created.consumer.js';
import { handleAssessmentQuizSubmitted } from './assessment.quiz.submitted.consumer.js';
import { handleMentoringFeedbackPublished } from './mentoring.feedback.published.consumer.js';
import { handleSystemProfileUpdated } from './system.profile.updated.consumer.js';

export interface MotivationConsumerDeps {
  masteryRepo: MasteryStateRepository;
  skillScoreRepo: SkillScoreRepository;
  logger: Logger;
}

export function setupEventConsumers(
  eventBus: EventBus,
  deps: MotivationConsumerDeps
): void {
  const wrap = <E>(h: (e: E, d: MotivationConsumerDeps) => Promise<void>) =>
    (event: E) => h(event, deps);

  eventBus.subscribe('system.user.registered', wrap(handleSystemUserRegistered));
  eventBus.subscribe('curriculum.course.enrolled', wrap(handleCurriculumCourseEnrolled));
  eventBus.subscribe('learning.lesson.completed', wrap(handleLearningLessonCompleted));
  eventBus.subscribe('learning.submission.created', wrap(handleLearningSubmissionCreated));
  eventBus.subscribe('assessment.quiz.submitted', wrap(handleAssessmentQuizSubmitted));
  eventBus.subscribe('mentoring.feedback.published', wrap(handleMentoringFeedbackPublished));
  eventBus.subscribe('system.profile.updated', wrap(handleSystemProfileUpdated));

  deps.logger.info('Event consumers registered', {});
}
