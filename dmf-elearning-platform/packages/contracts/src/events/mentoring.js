/**
 * Mentoring domain events (Sự kiện miền Hướng dẫn)
 *
 * From STEP 5C (event-contracts.md)
 * Frozen: Do not modify without architecture approval.
 *
 * IMPORTANT: Event payloads are IDs-only (no feedback text, no rubric scores).
 */
import { z } from 'zod';
export const mentoringFeedbackRequestedSchema = z.object({
    eventName: z.literal('mentoring.feedback.requested'),
    payload: z.object({
        eventId: z.string(),
        occurredAt: z.string(),
        correlationId: z.string().optional(),
        submissionId: z.string().brand(),
        userId: z.string().brand(),
    }),
});
export const mentoringFeedbackPublishedSchema = z.object({
    eventName: z.literal('mentoring.feedback.published'),
    payload: z.object({
        eventId: z.string(),
        occurredAt: z.string(),
        correlationId: z.string().optional(),
        feedbackId: z.string().brand(),
        submissionId: z.string().brand(),
        authorId: z.string(),
    }),
});
//# sourceMappingURL=mentoring.js.map