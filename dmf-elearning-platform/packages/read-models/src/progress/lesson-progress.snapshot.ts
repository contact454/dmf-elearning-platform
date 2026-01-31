/**
 * Lesson Progress Snapshot Read Model
 * 
 * Snapshot of a specific lesson's progress for a user.
 * Includes attempt status and submitted activities.
 */

import type { LessonId, AttemptId, ActivityId, SubmissionId } from '@dmf/shared';

export interface SubmittedActivity {
  activityId: ActivityId;
  submissionId: SubmissionId;
  type: 'quiz' | 'listening' | 'speaking' | 'writing';
  submittedAt: string; // ISO timestamp
}

export interface LessonProgressSnapshot {
  lessonId: LessonId;
  attemptId?: AttemptId;
  status: 'not-started' | 'in-progress' | 'completed' | 'abandoned';
  submittedActivities: SubmittedActivity[];
  startedAt?: string; // ISO timestamp
  completedAt?: string; // ISO timestamp
}

/**
 * Create empty snapshot for a lesson
 */
export function createEmptySnapshot(lessonId: LessonId): LessonProgressSnapshot {
  return {
    lessonId,
    attemptId: undefined,
    status: 'not-started',
    submittedActivities: [],
    startedAt: undefined,
    completedAt: undefined,
  };
}
