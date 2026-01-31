/**
 * User Learning Dashboard Read Model
 * 
 * Aggregated view of user's learning progress across courses, lessons, and activities.
 * Updated via event projections (read-only).
 */

import type { UserId, CourseId, LessonId, AttemptId } from '@dmf/shared';

export interface CourseProgress {
  courseId: CourseId;
  title: string;
  progressPercent: number; // 0-100
  completedLessons: number;
  totalLessons: number;
  lastActivityAt: string; // ISO timestamp
}

export interface ActiveLesson {
  lessonId: LessonId;
  attemptId: AttemptId;
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: string; // ISO timestamp
}

export interface UserLearningDashboard {
  userId: UserId;
  courses: CourseProgress[];
  activeLesson?: ActiveLesson;
  lastUpdatedAt: string; // ISO timestamp
}

/**
 * Create empty dashboard for a user
 */
export function createEmptyDashboard(userId: UserId): UserLearningDashboard {
  return {
    userId,
    courses: [],
    activeLesson: undefined,
    lastUpdatedAt: new Date().toISOString(),
  };
}
