/**
 * Event consumers setup for progress-service.
 * Uses in-memory ProgressState repository + processed-events dedupe.
 */

import type { EventBus, Logger } from '@dmf/infra';
import type { ProgressStateRepository } from '../../state/in-memory-progress.repository.js';
import { handleSystemUserRegistered } from './system.user.registered.consumer.js';
import { handleCurriculumCourseEnrolled } from './curriculum.course.enrolled.consumer.js';
import { handleLearningLessonStarted } from './learning.lesson.started.consumer.js';
import { handleLearningLessonCompleted } from './learning.lesson.completed.consumer.js';

export interface ProgressConsumerDeps {
  progressRepo: ProgressStateRepository;
  logger: Logger;
}

export function setupEventConsumers(
  eventBus: EventBus,
  deps: ProgressConsumerDeps
): void {
  const wrap = (
    handler: (e: Parameters<typeof handleSystemUserRegistered>[0], d: ProgressConsumerDeps) => Promise<void>
  ) => {
    return (event: Parameters<typeof handler>[0]) => handler(event, deps);
  };

  eventBus.subscribe('system.user.registered', wrap(handleSystemUserRegistered));
  eventBus.subscribe('curriculum.course.enrolled', wrap(handleCurriculumCourseEnrolled));
  eventBus.subscribe('learning.lesson.started', wrap(handleLearningLessonStarted));
  eventBus.subscribe('learning.lesson.completed', wrap(handleLearningLessonCompleted));

  deps.logger.info('Event consumers registered', {});
}
