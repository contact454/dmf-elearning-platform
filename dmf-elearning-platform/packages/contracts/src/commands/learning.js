/**
 * Learning domain commands (Lệnh miền Học tập)
 *
 * From STEP 4.2 (command-contracts.md)
 * 🔒 CONTRACT FROZEN — Track 5
 *
 * Rules:
 * ❌ Do NOT change field names
 * ❌ Do NOT rename fields
 * ❌ Do NOT reorder payload fields
 * ✅ Only add optional fields if absolutely necessary (with architecture approval)
 */
import { z } from 'zod';
export const learningLessonStartSchema = z.object({
    userId: z.string().brand(),
    lessonId: z.string().brand(),
    correlationId: z.string().optional(),
});
export const learningLessonCompleteSchema = z.object({
    attemptId: z.string().brand(),
    status: z.enum(['completed', 'abandoned']),
    correlationId: z.string().optional(),
});
export const learningLessonAbandonSchema = z.object({
    attemptId: z.string().brand(),
});
export const learningActivitySubmitSchema = z.object({
    attemptId: z.string().brand(),
    activityId: z.string().brand(),
    type: z.enum(['quiz', 'listening', 'speaking', 'writing']),
    answer: z.string().optional(),
    audioUrl: z.string().url().optional(),
    correlationId: z.string().optional(),
});
//# sourceMappingURL=learning.js.map