import { SubmissionId, FeedbackId, AttemptId } from '../ids';
import { FeedbackAuthor } from '../enums';
import { DomainEvent } from './envelope';

/**
 * Mentoring Domain Event Payloads
 */

export interface FeedbackRequestedPayload {
    submissionId: SubmissionId;
}

export interface FeedbackPublishedPayload {
    feedbackId: FeedbackId;
    submissionId: SubmissionId;
    author: FeedbackAuthor; // Required for anti "học ảo" measurement
    targetAttemptId?: AttemptId; // Optional: if feedback targets attempt-level work
}

/**
 * Mentoring Domain Events
 */
export type MentoringEvent =
    | DomainEvent<'mentoring.feedback.requested', FeedbackRequestedPayload>
    | DomainEvent<'mentoring.feedback.published', FeedbackPublishedPayload>;
