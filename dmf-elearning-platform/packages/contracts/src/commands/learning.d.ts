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
import type { UserId, LessonId, AttemptId, ActivityId } from '@dmf/shared';
/**
 * Command: learning.lesson.start
 * Handled by: practice-service
 * 🔒 CONTRACT FROZEN — Track 5
 */
export interface LearningLessonStartCommand {
    userId: UserId;
    lessonId: LessonId;
    correlationId?: string;
}
export declare const learningLessonStartSchema: z.ZodObject<{
    userId: z.ZodBranded<z.ZodString, "UserId">;
    lessonId: z.ZodBranded<z.ZodString, "LessonId">;
    correlationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string & z.BRAND<"UserId">;
    lessonId: string & z.BRAND<"LessonId">;
    correlationId?: string | undefined;
}, {
    userId: string;
    lessonId: string;
    correlationId?: string | undefined;
}>;
/**
 * Command: learning.lesson.complete
 * Handled by: practice-service
 * 🔒 CONTRACT FROZEN — Track 5
 */
export interface LearningLessonCompleteCommand {
    attemptId: AttemptId;
    status: 'completed' | 'abandoned';
    correlationId?: string;
}
export declare const learningLessonCompleteSchema: z.ZodObject<{
    attemptId: z.ZodBranded<z.ZodString, "AttemptId">;
    status: z.ZodEnum<["completed", "abandoned"]>;
    correlationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "completed" | "abandoned";
    attemptId: string & z.BRAND<"AttemptId">;
    correlationId?: string | undefined;
}, {
    status: "completed" | "abandoned";
    attemptId: string;
    correlationId?: string | undefined;
}>;
/**
 * Command: learning.lesson.abandon
 * Handled by: practice-service
 * 🔒 CONTRACT FROZEN — Track 5
 */
export interface LearningLessonAbandonCommand {
    attemptId: AttemptId;
}
export declare const learningLessonAbandonSchema: z.ZodObject<{
    attemptId: z.ZodBranded<z.ZodString, "AttemptId">;
}, "strip", z.ZodTypeAny, {
    attemptId: string & z.BRAND<"AttemptId">;
}, {
    attemptId: string;
}>;
/**
 * Command: learning.activity.submit
 * Handled by: practice-service
 * 🔒 CONTRACT FROZEN — Track 5
 */
export interface LearningActivitySubmitCommand {
    attemptId: AttemptId;
    activityId: ActivityId;
    type: 'quiz' | 'listening' | 'speaking' | 'writing';
    answer?: string;
    audioUrl?: string;
    correlationId?: string;
}
export declare const learningActivitySubmitSchema: z.ZodObject<{
    attemptId: z.ZodBranded<z.ZodString, "AttemptId">;
    activityId: z.ZodBranded<z.ZodString, "ActivityId">;
    type: z.ZodEnum<["quiz", "listening", "speaking", "writing"]>;
    answer: z.ZodOptional<z.ZodString>;
    audioUrl: z.ZodOptional<z.ZodString>;
    correlationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "speaking" | "listening" | "writing" | "quiz";
    attemptId: string & z.BRAND<"AttemptId">;
    activityId: string & z.BRAND<"ActivityId">;
    correlationId?: string | undefined;
    answer?: string | undefined;
    audioUrl?: string | undefined;
}, {
    type: "speaking" | "listening" | "writing" | "quiz";
    attemptId: string;
    activityId: string;
    correlationId?: string | undefined;
    answer?: string | undefined;
    audioUrl?: string | undefined;
}>;
//# sourceMappingURL=learning.d.ts.map