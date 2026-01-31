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
export const learningLessonStartedSchema = z.object({
    eventName: z.literal('learning.lesson.started'),
    payload: z.object({
        eventId: z.string(),
        occurredAt: z.string(),
        correlationId: z.string().optional(),
        attemptId: z.string().brand(),
        userId: z.string().brand(),
        lessonId: z.string().brand(),
    }),
});
export const learningSubmissionCreatedSchema = z.object({
    eventName: z.literal('learning.submission.created'),
    payload: z.object({
        eventId: z.string(),
        occurredAt: z.string(),
        correlationId: z.string().optional(),
        submissionId: z.string().brand(),
        attemptId: z.string().brand(),
        activityId: z.string().brand(),
        lessonId: z.string().brand(),
    }),
});
export const learningLessonCompletedSchema = z.object({
    eventName: z.literal('learning.lesson.completed'),
    payload: z.object({
        eventId: z.string(),
        occurredAt: z.string(),
        correlationId: z.string().optional(),
        attemptId: z.string().brand(),
        userId: z.string().brand(),
        lessonId: z.string().brand(),
    }),
});
export const learningLessonAbandonedSchema = z.object({
    eventName: z.literal('learning.lesson.abandoned'),
    payload: z.object({
        eventId: z.string(),
        occurredAt: z.string(),
        correlationId: z.string().optional(),
        attemptId: z.string().brand(),
        userId: z.string().brand(),
        lessonId: z.string().brand(),
    }),
});
//# sourceMappingURL=learning.js.map