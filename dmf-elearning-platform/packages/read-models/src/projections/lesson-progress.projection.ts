/**
 * Lesson Progress Projection (Read-only Event Listener)
 * 
 * Updates LessonProgressSnapshot read model based on events.
 * NO side effects, NO domain logic, ONLY read model updates.
 */

import type { Event } from '@dmf/infra';
import type { LessonId, AttemptId, ActivityId, SubmissionId, UserId } from '@dmf/shared';
import type { LessonProgressSnapshot, SubmittedActivity } from '../progress/lesson-progress.snapshot.js';

/**
 * Lesson progress read store (in-memory for dev/E2E)
 * Key: `${userId}:${lessonId}`
 */
const lessonProgressStore = new Map<string, LessonProgressSnapshot>();

/**
 * Get lesson progress snapshot
 */
export function getLessonProgress(userId: UserId, lessonId: LessonId): LessonProgressSnapshot | null {
  const key = `${userId}:${lessonId}`;
  return lessonProgressStore.get(key) || null;
}

/**
 * Project learning.lesson.started event
 */
export function projectLessonStarted(event: Event): void {
  const userId = event.payload.userId as UserId;
  const lessonId = event.payload.lessonId as LessonId;
  const attemptId = event.payload.attemptId as AttemptId;

  const key = `${userId}:${lessonId}`;
  let snapshot = lessonProgressStore.get(key);
  
  if (!snapshot) {
    snapshot = {
      lessonId,
      attemptId: undefined,
      status: 'not-started',
      submittedActivities: [],
      startedAt: undefined,
      completedAt: undefined,
    };
  }

  snapshot.attemptId = attemptId;
  snapshot.status = 'in-progress';
  snapshot.startedAt = new Date().toISOString();

  lessonProgressStore.set(key, snapshot);
}

/**
 * Project learning.submission.created event
 */
export function projectSubmissionCreated(event: Event): void {
  // Note: learning.submission.created event payload includes lessonId and attemptId
  // We need userId to create the key, but it's not in the payload
  // For MVP, we'll store by attemptId+lessonId and look up by both
  const lessonId = event.payload.lessonId as LessonId;
  const attemptId = event.payload.attemptId as AttemptId;
  const activityId = event.payload.activityId as ActivityId;
  const submissionId = event.payload.submissionId as SubmissionId;

  // Use attemptId:lessonId as key (we'll need to query by attemptId in production)
  // For now, this is a simplified approach
  const key = `${attemptId}:${lessonId}`;

  let snapshot = lessonProgressStore.get(key);
  if (!snapshot) {
    snapshot = {
      lessonId,
      attemptId,
      status: 'in-progress',
      submittedActivities: [],
      startedAt: undefined,
      completedAt: undefined,
    };
  }

  // Add submission if not exists
  const existingActivity = snapshot.submittedActivities.find((a) => a.activityId === activityId);
  if (!existingActivity) {
    const newActivity: SubmittedActivity = {
      activityId,
      submissionId,
      type: 'quiz', // TODO: Get from submission event payload if available
      submittedAt: new Date().toISOString(),
    };
    snapshot.submittedActivities.push(newActivity);
  }

  lessonProgressStore.set(key, snapshot);
}

/**
 * Project learning.lesson.completed event
 */
export function projectLessonCompleted(event: Event): void {
  const userId = event.payload.userId as UserId;
  const lessonId = event.payload.lessonId as LessonId;

  const key = `${userId}:${lessonId}`;
  const snapshot = lessonProgressStore.get(key);
  if (!snapshot) {
    return; // No snapshot to update
  }

  snapshot.status = 'completed';
  snapshot.completedAt = new Date().toISOString();

  lessonProgressStore.set(key, snapshot);
}
