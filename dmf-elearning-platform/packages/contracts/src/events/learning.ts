/**
 * Learning domain events (Sự kiện miền Học tập)
 * 
 * From STEP 5C (event-contracts.md)
 * 🔒 CONTRACT FROZEN — Track 5
 * 
 * Rules:
 * ❌ Do NOT change field names
 * ❌ Do NOT rename fields
 * ❌ Do NOT reorder payload fields
 * ✅ Only add optional fields if absolutely necessary (with architecture approval)
 * ✅ Events MUST be IDs-only (no computed values)
 * 
 * Freeze Date: Track 5 completion
 * Freeze Reason: Learning Core APIs ready for UI integration and Phase 2
 */

import { z } from 'zod';
import type { UserId, LessonId, AttemptId, ActivityId, SubmissionId } from '@dmf/shared';

/**
 * Event: learning.lesson.started
 * Emitted by: practice-service
 * Consumed by: progress-service, read-service projections
 * 🔒 CONTRACT FROZEN — Track 5
 */
export interface LearningLessonStartedEvent {
  eventName: 'learning.lesson.started';
  payload: {
    eventId: string;
    occurredAt: string; // ISO timestamp
    correlationId?: string;
    attemptId: AttemptId;
    userId: UserId;
    lessonId: LessonId;
  };
}

export const learningLessonStartedSchema = z.object({
  eventName: z.literal('learning.lesson.started'),
  payload: z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    correlationId: z.string().optional(),
    attemptId: z.string().brand<'AttemptId'>(),
    userId: z.string().brand<'UserId'>(),
    lessonId: z.string().brand<'LessonId'>(),
  }),
});

/**
 * Event: learning.submission.created
 * Emitted by: practice-service
 * Consumed by: assessment-service, motivation-progress-service, read-service projections
 * Payload: IDs only (no text, no audioUrl, no score)
 * 🔒 CONTRACT FROZEN — Track 5
 */
export interface LearningSubmissionCreatedEvent {
  eventName: 'learning.submission.created';
  payload: {
    eventId: string;
    occurredAt: string; // ISO timestamp
    correlationId?: string;
    submissionId: SubmissionId;
    attemptId: AttemptId;
    activityId: ActivityId;
    lessonId: LessonId; // From Attempt
  };
}

export const learningSubmissionCreatedSchema = z.object({
  eventName: z.literal('learning.submission.created'),
  payload: z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    correlationId: z.string().optional(),
    submissionId: z.string().brand<'SubmissionId'>(),
    attemptId: z.string().brand<'AttemptId'>(),
    activityId: z.string().brand<'ActivityId'>(),
    lessonId: z.string().brand<'LessonId'>(),
  }),
});

/**
 * Event: learning.lesson.completed
 * Emitted by: practice-service
 * Consumed by: progress-service, read-service projections
 * 🔒 CONTRACT FROZEN — Track 5
 */
export interface LearningLessonCompletedEvent {
  eventName: 'learning.lesson.completed';
  payload: {
    eventId: string;
    occurredAt: string; // ISO timestamp
    correlationId?: string;
    attemptId: AttemptId;
    userId: UserId;
    lessonId: LessonId;
  };
}

export const learningLessonCompletedSchema = z.object({
  eventName: z.literal('learning.lesson.completed'),
  payload: z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    correlationId: z.string().optional(),
    attemptId: z.string().brand<'AttemptId'>(),
    userId: z.string().brand<'UserId'>(),
    lessonId: z.string().brand<'LessonId'>(),
  }),
});

/**
 * Event: learning.lesson.abandoned
 * Emitted by: practice-service
 * Payload: IDs only
 * 🔒 CONTRACT FROZEN — Track 5
 */
export interface LearningLessonAbandonedEvent {
  eventName: 'learning.lesson.abandoned';
  payload: {
    eventId: string;
    occurredAt: string; // ISO 8601
    correlationId?: string;
    attemptId: AttemptId;
    userId: UserId;
    lessonId: LessonId;
  };
}

export const learningLessonAbandonedSchema = z.object({
  eventName: z.literal('learning.lesson.abandoned'),
  payload: z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    correlationId: z.string().optional(),
    attemptId: z.string().brand<'AttemptId'>(),
    userId: z.string().brand<'UserId'>(),
    lessonId: z.string().brand<'LessonId'>(),
  }),
});
