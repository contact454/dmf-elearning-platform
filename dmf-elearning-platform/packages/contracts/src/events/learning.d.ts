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
import type { UserId, LessonId, AttemptId, ActivityId, SubmissionId } from '@dmf/shared';
/**
 * Event: learning.lesson.started
 * Emitted by: practice-service
 * Consumed by: progress-service, read-service projections
 * 🔒 CONTRACT FROZEN — Track 5
 */
export interface LearningLessonStartedEvent {
    eventName: 'learning.lesson.started';
    payload: {
        eventId: string;
        occurredAt: string;
        correlationId?: string;
        attemptId: AttemptId;
        userId: UserId;
        lessonId: LessonId;
    };
}
export declare const learningLessonStartedSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"learning.lesson.started">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        correlationId: z.ZodOptional<z.ZodString>;
        attemptId: z.ZodBranded<z.ZodString, "AttemptId">;
        userId: z.ZodBranded<z.ZodString, "UserId">;
        lessonId: z.ZodBranded<z.ZodString, "LessonId">;
    }, "strip", z.ZodTypeAny, {
        userId: string & z.BRAND<"UserId">;
        lessonId: string & z.BRAND<"LessonId">;
        attemptId: string & z.BRAND<"AttemptId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }, {
        userId: string;
        lessonId: string;
        attemptId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "learning.lesson.started";
    payload: {
        userId: string & z.BRAND<"UserId">;
        lessonId: string & z.BRAND<"LessonId">;
        attemptId: string & z.BRAND<"AttemptId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}, {
    eventName: "learning.lesson.started";
    payload: {
        userId: string;
        lessonId: string;
        attemptId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}>;
/**
 * Event: learning.submission.created
 * Emitted by: practice-service
 * Consumed by: assessment-service, motivation-progress-service, read-service projections
 * Payload: IDs only (no text, no audioUrl, no score)
 * 🔒 CONTRACT FROZEN — Track 5
 */
export interface LearningSubmissionCreatedEvent {
    eventName: 'learning.submission.created';
    payload: {
        eventId: string;
        occurredAt: string;
        correlationId?: string;
        submissionId: SubmissionId;
        attemptId: AttemptId;
        activityId: ActivityId;
        lessonId: LessonId;
    };
}
export declare const learningSubmissionCreatedSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"learning.submission.created">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        correlationId: z.ZodOptional<z.ZodString>;
        submissionId: z.ZodBranded<z.ZodString, "SubmissionId">;
        attemptId: z.ZodBranded<z.ZodString, "AttemptId">;
        activityId: z.ZodBranded<z.ZodString, "ActivityId">;
        lessonId: z.ZodBranded<z.ZodString, "LessonId">;
    }, "strip", z.ZodTypeAny, {
        lessonId: string & z.BRAND<"LessonId">;
        attemptId: string & z.BRAND<"AttemptId">;
        activityId: string & z.BRAND<"ActivityId">;
        submissionId: string & z.BRAND<"SubmissionId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }, {
        lessonId: string;
        attemptId: string;
        activityId: string;
        submissionId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "learning.submission.created";
    payload: {
        lessonId: string & z.BRAND<"LessonId">;
        attemptId: string & z.BRAND<"AttemptId">;
        activityId: string & z.BRAND<"ActivityId">;
        submissionId: string & z.BRAND<"SubmissionId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}, {
    eventName: "learning.submission.created";
    payload: {
        lessonId: string;
        attemptId: string;
        activityId: string;
        submissionId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}>;
/**
 * Event: learning.lesson.completed
 * Emitted by: practice-service
 * Consumed by: progress-service, read-service projections
 * 🔒 CONTRACT FROZEN — Track 5
 */
export interface LearningLessonCompletedEvent {
    eventName: 'learning.lesson.completed';
    payload: {
        eventId: string;
        occurredAt: string;
        correlationId?: string;
        attemptId: AttemptId;
        userId: UserId;
        lessonId: LessonId;
    };
}
export declare const learningLessonCompletedSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"learning.lesson.completed">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        correlationId: z.ZodOptional<z.ZodString>;
        attemptId: z.ZodBranded<z.ZodString, "AttemptId">;
        userId: z.ZodBranded<z.ZodString, "UserId">;
        lessonId: z.ZodBranded<z.ZodString, "LessonId">;
    }, "strip", z.ZodTypeAny, {
        userId: string & z.BRAND<"UserId">;
        lessonId: string & z.BRAND<"LessonId">;
        attemptId: string & z.BRAND<"AttemptId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }, {
        userId: string;
        lessonId: string;
        attemptId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "learning.lesson.completed";
    payload: {
        userId: string & z.BRAND<"UserId">;
        lessonId: string & z.BRAND<"LessonId">;
        attemptId: string & z.BRAND<"AttemptId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}, {
    eventName: "learning.lesson.completed";
    payload: {
        userId: string;
        lessonId: string;
        attemptId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}>;
/**
 * Event: learning.lesson.abandoned
 * Emitted by: practice-service
 * Payload: IDs only
 * 🔒 CONTRACT FROZEN — Track 5
 */
export interface LearningLessonAbandonedEvent {
    eventName: 'learning.lesson.abandoned';
    payload: {
        eventId: string;
        occurredAt: string;
        correlationId?: string;
        attemptId: AttemptId;
        userId: UserId;
        lessonId: LessonId;
    };
}
export declare const learningLessonAbandonedSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"learning.lesson.abandoned">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        correlationId: z.ZodOptional<z.ZodString>;
        attemptId: z.ZodBranded<z.ZodString, "AttemptId">;
        userId: z.ZodBranded<z.ZodString, "UserId">;
        lessonId: z.ZodBranded<z.ZodString, "LessonId">;
    }, "strip", z.ZodTypeAny, {
        userId: string & z.BRAND<"UserId">;
        lessonId: string & z.BRAND<"LessonId">;
        attemptId: string & z.BRAND<"AttemptId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }, {
        userId: string;
        lessonId: string;
        attemptId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "learning.lesson.abandoned";
    payload: {
        userId: string & z.BRAND<"UserId">;
        lessonId: string & z.BRAND<"LessonId">;
        attemptId: string & z.BRAND<"AttemptId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}, {
    eventName: "learning.lesson.abandoned";
    payload: {
        userId: string;
        lessonId: string;
        attemptId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}>;
//# sourceMappingURL=learning.d.ts.map