import { LessonId, AttemptId, SubmissionId, ActivityId } from '../ids';
import { AttemptStatus, SubmissionType } from '../enums';
import { DomainEvent } from './envelope';

/**
 * Learning Domain Event Payloads
 */

export interface LessonStartedPayload {
    lessonId: LessonId;
    attemptId: AttemptId;
}

export interface LessonCompletedPayload {
    lessonId: LessonId;
    attemptId: AttemptId;
    status: AttemptStatus; // 'completed' or 'abandoned' (implied by event name)
    score?: number; // 0-100
}

export interface LessonAbandonedPayload {
    lessonId: LessonId;
    attemptId: AttemptId;
}

export interface SubmissionCreatedPayload {
    submissionId: SubmissionId;
    attemptId: AttemptId;
    activityId: ActivityId;
    lessonId: LessonId;
    type: SubmissionType; // Required for anti "học ảo" measurement
}

/**
 * Learning Domain Events
 */
export type LearningEvent =
    | DomainEvent<'learning.lesson.started', LessonStartedPayload>
    | DomainEvent<'learning.lesson.completed', LessonCompletedPayload>
    | DomainEvent<'learning.lesson.abandoned', LessonAbandonedPayload>
    | DomainEvent<'learning.submission.created', SubmissionCreatedPayload>;
