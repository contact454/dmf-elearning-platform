/**
 * Event consumers setup (Thiết lập Người tiêu dùng Sự kiện)
 * 
 * Registers event consumers for cache invalidation.
 * Only invalidates cache, does NOT mutate state.
 */

import type { EventBus, Logger, Database, HttpClient } from '@dmf/infra';
import { handleLearningLessonCompleted } from './learning.lesson.completed.consumer';
import { handleLearningSubmissionCreated } from './learning.submission.created.consumer';
import { handleAssessmentQuizSubmitted } from './assessment.quiz.submitted.consumer';
import { handleMentoringFeedbackPublished } from './mentoring.feedback.published.consumer';
import { handleSystemProfileUpdated } from './system.profile.updated.consumer';

export function setupEventConsumers(
  eventBus: EventBus,
  database: Database,
  logger: Logger,
  httpClient?: HttpClient
): void {
  // Subscribe to events for cache invalidation (Đăng ký sự kiện để vô hiệu hóa cache)
  eventBus.subscribe('learning.lesson.completed', async (event) => {
    await handleLearningLessonCompleted(event, { database, logger });
  });

  eventBus.subscribe('learning.submission.created', async (event) => {
    await handleLearningSubmissionCreated(event, { database, logger, httpClient: httpClient! });
  });

  eventBus.subscribe('assessment.quiz.submitted', async (event) => {
    await handleAssessmentQuizSubmitted(event, { database, logger });
  });

  eventBus.subscribe('mentoring.feedback.published', async (event) => {
    await handleMentoringFeedbackPublished(event, { database, logger, httpClient: httpClient! });
  });

  eventBus.subscribe('system.profile.updated', async (event) => {
    await handleSystemProfileUpdated(event, { database, logger });
  });

  logger.info('Event consumers registered for cache invalidation', {});
}
