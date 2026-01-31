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
        occurredAt: string;
        correlationId?: string;
        submissionId: SubmissionId;
        userId: UserId;
    };
}
export declare const mentoringFeedbackRequestedSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"mentoring.feedback.requested">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        correlationId: z.ZodOptional<z.ZodString>;
        submissionId: z.ZodBranded<z.ZodString, "SubmissionId">;
        userId: z.ZodBranded<z.ZodString, "UserId">;
    }, "strip", z.ZodTypeAny, {
        userId: string & z.BRAND<"UserId">;
        submissionId: string & z.BRAND<"SubmissionId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }, {
        userId: string;
        submissionId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "mentoring.feedback.requested";
    payload: {
        userId: string & z.BRAND<"UserId">;
        submissionId: string & z.BRAND<"SubmissionId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}, {
    eventName: "mentoring.feedback.requested";
    payload: {
        userId: string;
        submissionId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}>;
/**
 * Event: mentoring.feedback.published
 * Emitted by: mentoring-service
 * Payload: IDs only (no feedback text, no rubric scores)
 */
export interface MentoringFeedbackPublishedEvent {
    eventName: 'mentoring.feedback.published';
    payload: {
        eventId: string;
        occurredAt: string;
        correlationId?: string;
        feedbackId: FeedbackId;
        submissionId: SubmissionId;
        authorId: string;
    };
}
export declare const mentoringFeedbackPublishedSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"mentoring.feedback.published">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        correlationId: z.ZodOptional<z.ZodString>;
        feedbackId: z.ZodBranded<z.ZodString, "FeedbackId">;
        submissionId: z.ZodBranded<z.ZodString, "SubmissionId">;
        authorId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        submissionId: string & z.BRAND<"SubmissionId">;
        authorId: string;
        eventId: string;
        occurredAt: string;
        feedbackId: string & z.BRAND<"FeedbackId">;
        correlationId?: string | undefined;
    }, {
        submissionId: string;
        authorId: string;
        eventId: string;
        occurredAt: string;
        feedbackId: string;
        correlationId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "mentoring.feedback.published";
    payload: {
        submissionId: string & z.BRAND<"SubmissionId">;
        authorId: string;
        eventId: string;
        occurredAt: string;
        feedbackId: string & z.BRAND<"FeedbackId">;
        correlationId?: string | undefined;
    };
}, {
    eventName: "mentoring.feedback.published";
    payload: {
        submissionId: string;
        authorId: string;
        eventId: string;
        occurredAt: string;
        feedbackId: string;
        correlationId?: string | undefined;
    };
}>;
//# sourceMappingURL=mentoring.d.ts.map