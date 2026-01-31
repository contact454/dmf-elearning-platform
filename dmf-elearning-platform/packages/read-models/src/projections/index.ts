/**
 * Event Projections (Read-only)
 * 
 * Projections update read models based on domain events.
 * These are pure read-side updates with no domain logic.
 */

// Dashboard projections
export {
  getDashboard,
  projectLessonStarted as projectDashboardLessonStarted,
  projectLessonCompleted as projectDashboardLessonCompleted,
  projectCourseEnrolled,
} from './dashboard.projection.js';

// Lesson progress projections
export {
  getLessonProgress,
  projectLessonStarted as projectProgressLessonStarted,
  projectSubmissionCreated,
  projectLessonCompleted as projectProgressLessonCompleted,
} from './lesson-progress.projection.js';
