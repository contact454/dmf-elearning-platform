/**
 * Mentoring domain events (Sự kiện miền Hướng dẫn)
 * 
 * From STEP 5C (event-contracts.md)
 * Frozen: Do not modify without architecture approval.
 * 
 * IMPORTANT: Event payloads are IDs-only (no feedback text, no rubric scores).
 */

import { z } from 'zod';
import type { SubmissionId, UserId, FeedbackId } from '@dmf/shared';

/**
 * Event: mentoring.feedback.requested
 * Emitted by: mentoring-service
 * Payload: IDs only
 */
export interface MentoringFeedbackRequestedEvent {
  eventName: 'mentoring.feedback.requested';
  payload: {
    eventId: string;
    occurredAt: string; // ISO 8601
    correlationId?: string;
    submissionId: SubmissionId;
    userId: UserId;
  };
}

export const mentoringFeedbackRequestedSchema = z.object({
  eventName: z.literal('mentoring.feedback.requested'),
  payload: z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    correlationId: z.string().optional(),
    submissionId: z.string().brand<'SubmissionId'>(),
    userId: z.string().brand<'UserId'>(),
  }),
});

/**
 * Event: mentoring.feedback.published
 * Emitted by: mentoring-service
 * Payload: IDs only (no feedback text, no rubric scores)
 */
export interface MentoringFeedbackPublishedEvent {
  eventName: 'mentoring.feedback.published';
  payload: {
    eventId: string;
    occurredAt: string; // ISO 8601
    correlationId?: string;
    feedbackId: FeedbackId;
    submissionId: SubmissionId;
    authorId: string; // Teacher/Mentor ID or 'ai'
  };
}

export const mentoringFeedbackPublishedSchema = z.object({
  eventName: z.literal('mentoring.feedback.published'),
  payload: z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    correlationId: z.string().optional(),
    feedbackId: z.string().brand<'FeedbackId'>(),
    submissionId: z.string().brand<'SubmissionId'>(),
    authorId: z.string(),
  }),
});
