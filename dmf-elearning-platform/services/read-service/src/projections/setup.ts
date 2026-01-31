/**
 * Setup Event Projections (Thiết lập Dự báo Sự kiện)
 * 
 * Registers read-only event listeners that update read models.
 * NO domain logic, ONLY read model updates.
 */

import type { EventBus, Logger } from '@dmf/infra';
import {
  projectLessonStarted as projectDashboardLessonStarted,
  projectLessonCompleted as projectDashboardLessonCompleted,
  projectCourseEnrolled,
} from '@dmf/read-models/projections/dashboard';
import {
  projectLessonStarted as projectProgressLessonStarted,
  projectSubmissionCreated,
  projectLessonCompleted as projectProgressLessonCompleted,
} from '@dmf/read-models/projections/lesson-progress';

export function setupProjections(eventBus: EventBus, logger: Logger): void {
  // Dashboard projections
  eventBus.subscribe('learning.lesson.started', async (event) => {
    try {
      projectDashboardLessonStarted(event);
      projectProgressLessonStarted(event);
      logger.info('Dashboard projection updated for lesson.started', { eventId: event.payload.eventId });
    } catch (error) {
      logger.error('Dashboard projection failed for lesson.started', error as Error);
    }
  });

  eventBus.subscribe('learning.lesson.completed', async (event) => {
    try {
      projectDashboardLessonCompleted(event);
      projectProgressLessonCompleted(event);
      logger.info('Dashboard projection updated for lesson.completed', { eventId: event.payload.eventId });
    } catch (error) {
      logger.error('Dashboard projection failed for lesson.completed', error as Error);
    }
  });

  eventBus.subscribe('curriculum.course.enrolled', async (event) => {
    try {
      projectCourseEnrolled(event);
      logger.info('Dashboard projection updated for course.enrolled', { eventId: event.payload.eventId });
    } catch (error) {
      logger.error('Dashboard projection failed for course.enrolled', error as Error);
    }
  });

  eventBus.subscribe('learning.submission.created', async (event) => {
    try {
      projectSubmissionCreated(event);
      logger.info('Lesson progress projection updated for submission.created', { eventId: event.payload.eventId });
    } catch (error) {
      logger.error('Lesson progress projection failed for submission.created', error as Error);
    }
  });

  logger.info('Event projections registered', {});
}
