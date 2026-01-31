/**
 * Dashboard Projection (Read-only Event Listener)
 * 
 * Updates UserLearningDashboard read model based on events.
 * NO side effects, NO domain logic, ONLY read model updates.
 */

import type { Event } from '@dmf/infra';
import type { UserId, LessonId, AttemptId, CourseId } from '@dmf/shared';
import type { UserLearningDashboard, CourseProgress } from '../dashboard/user-learning.dashboard.js';

/**
 * Dashboard read store (in-memory for dev/E2E)
 * In production, this would be a database table or cache.
 */
const dashboardStore = new Map<UserId, UserLearningDashboard>();

/**
 * Get dashboard for a user
 */
export function getDashboard(userId: UserId): UserLearningDashboard | null {
  return dashboardStore.get(userId) || null;
}

/**
 * Project learning.lesson.started event
 */
export function projectLessonStarted(event: Event): void {
  const userId = event.payload.userId as UserId;
  const lessonId = event.payload.lessonId as LessonId;
  const attemptId = event.payload.attemptId as AttemptId;

  let dashboard = dashboardStore.get(userId);
  if (!dashboard) {
    dashboard = {
      userId,
      courses: [],
      activeLesson: undefined,
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  // Update active lesson
  dashboard.activeLesson = {
    lessonId,
    attemptId,
    status: 'in-progress',
    startedAt: new Date().toISOString(),
  };

  dashboard.lastUpdatedAt = new Date().toISOString();
  dashboardStore.set(userId, dashboard);
}

/**
 * Project learning.lesson.completed event
 */
export function projectLessonCompleted(event: Event): void {
  const userId = event.payload.userId as UserId;
  const lessonId = event.payload.lessonId as LessonId;

  const dashboard = dashboardStore.get(userId);
  if (!dashboard) {
    return; // No dashboard to update
  }

  // Clear active lesson if it matches
  if (dashboard.activeLesson?.lessonId === lessonId) {
    dashboard.activeLesson = undefined;
  }

  // Update course progress (find course containing this lesson)
  // Note: In MVP, we assume lesson belongs to currentCourseId
  const courseId = dashboard.courses[0]?.courseId; // Simplified for MVP
  if (courseId) {
    const course = dashboard.courses.find((c) => c.courseId === courseId);
    if (course) {
      course.completedLessons = Math.max(course.completedLessons, 0) + 1;
      course.progressPercent = Math.min(100, (course.completedLessons / course.totalLessons) * 100);
      course.lastActivityAt = new Date().toISOString();
    }
  }

  dashboard.lastUpdatedAt = new Date().toISOString();
  dashboardStore.set(userId, dashboard);
}

/**
 * Project curriculum.course.enrolled event
 */
export function projectCourseEnrolled(event: Event): void {
  const userId = event.payload.userId as UserId;
  const courseId = event.payload.courseId as CourseId;

  let dashboard = dashboardStore.get(userId);
  if (!dashboard) {
    dashboard = {
      userId,
      courses: [],
      activeLesson: undefined,
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  // Add course if not exists
  const existingCourse = dashboard.courses.find((c) => c.courseId === courseId);
  if (!existingCourse) {
    const newCourse: CourseProgress = {
      courseId,
      title: `Course ${courseId}`, // TODO: Fetch from curriculum service
      progressPercent: 0,
      completedLessons: 0,
      totalLessons: 0, // TODO: Fetch from curriculum service
      lastActivityAt: new Date().toISOString(),
    };
    dashboard.courses.push(newCourse);
  }

  dashboard.lastUpdatedAt = new Date().toISOString();
  dashboardStore.set(userId, dashboard);
}
