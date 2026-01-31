/**
 * Assessment domain events (Sự kiện miền Đánh giá)
 *
 * From STEP 5C (event-contracts.md)
 * Frozen: Do not modify without architecture approval.
 *
 * IMPORTANT: Event payloads are IDs-only (no scores, no cefrLevel, no readiness).
 */
import { z } from 'zod';
export const assessmentQuizStartedSchema = z.object({
    eventName: z.literal('assessment.quiz.started'),
    payload: z.object({
        eventId: z.string(),
        occurredAt: z.string(),
        correlationId: z.string().optional(),
        assessmentId: z.string().brand(),
        userId: z.string().brand(),
        attemptId: z.string().brand().optional(),
    }),
});
export const assessmentQuizSubmittedSchema = z.object({
    eventName: z.literal('assessment.quiz.submitted'),
    payload: z.object({
        eventId: z.string(),
        occurredAt: z.string(),
        correlationId: z.string().optional(),
        assessmentId: z.string().brand(),
        userId: z.string().brand(),
    }),
});
export const assessmentLevelTestCompletedSchema = z.object({
    eventName: z.literal('assessment.level_test.completed'),
    payload: z.object({
        eventId: z.string(),
        occurredAt: z.string(),
        correlationId: z.string().optional(),
        assessmentId: z.string().brand(),
        userId: z.string().brand(),
    }),
});
//# sourceMappingURL=assessment.js.map