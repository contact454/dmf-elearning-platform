/**
 * Assessment domain events (Sự kiện miền Đánh giá)
 * 
 * From STEP 5C (event-contracts.md)
 * Frozen: Do not modify without architecture approval.
 * 
 * IMPORTANT: Event payloads are IDs-only (no scores, no cefrLevel, no readiness).
 */

import { z } from 'zod';
import type { AssessmentId, UserId, AttemptId } from '@dmf/shared';

/**
 * Event: assessment.quiz.started
 * Emitted by: assessment-service
 * Payload: IDs only
 */
export interface AssessmentQuizStartedEvent {
  eventName: 'assessment.quiz.started';
  payload: {
    eventId: string;
    occurredAt: string; // ISO 8601
    correlationId?: string;
    assessmentId: AssessmentId;
    userId: UserId;
    attemptId?: AttemptId;
  };
}

export const assessmentQuizStartedSchema = z.object({
  eventName: z.literal('assessment.quiz.started'),
  payload: z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    correlationId: z.string().optional(),
    assessmentId: z.string().brand<'AssessmentId'>(),
    userId: z.string().brand<'UserId'>(),
    attemptId: z.string().brand<'AttemptId'>().optional(),
  }),
});

/**
 * Event: assessment.quiz.submitted
 * Emitted by: assessment-service
 * Payload: IDs only (no score, no readiness)
 */
export interface AssessmentQuizSubmittedEvent {
  eventName: 'assessment.quiz.submitted';
  payload: {
    eventId: string;
    occurredAt: string; // ISO 8601
    correlationId?: string;
    assessmentId: AssessmentId;
    userId: UserId;
  };
}

export const assessmentQuizSubmittedSchema = z.object({
  eventName: z.literal('assessment.quiz.submitted'),
  payload: z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    correlationId: z.string().optional(),
    assessmentId: z.string().brand<'AssessmentId'>(),
    userId: z.string().brand<'UserId'>(),
  }),
});

/**
 * Event: assessment.level_test.completed
 * Emitted by: assessment-service
 * Payload: IDs only (no cefrLevel, no readiness)
 */
export interface AssessmentLevelTestCompletedEvent {
  eventName: 'assessment.level_test.completed';
  payload: {
    eventId: string;
    occurredAt: string; // ISO 8601
    correlationId?: string;
    assessmentId: AssessmentId;
    userId: UserId;
  };
}

export const assessmentLevelTestCompletedSchema = z.object({
  eventName: z.literal('assessment.level_test.completed'),
  payload: z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    correlationId: z.string().optional(),
    assessmentId: z.string().brand<'AssessmentId'>(),
    userId: z.string().brand<'UserId'>(),
  }),
});
