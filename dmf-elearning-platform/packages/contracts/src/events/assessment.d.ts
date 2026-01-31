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
        occurredAt: string;
        correlationId?: string;
        assessmentId: AssessmentId;
        userId: UserId;
        attemptId?: AttemptId;
    };
}
export declare const assessmentQuizStartedSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"assessment.quiz.started">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        correlationId: z.ZodOptional<z.ZodString>;
        assessmentId: z.ZodBranded<z.ZodString, "AssessmentId">;
        userId: z.ZodBranded<z.ZodString, "UserId">;
        attemptId: z.ZodOptional<z.ZodBranded<z.ZodString, "AttemptId">>;
    }, "strip", z.ZodTypeAny, {
        userId: string & z.BRAND<"UserId">;
        assessmentId: string & z.BRAND<"AssessmentId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
        attemptId?: (string & z.BRAND<"AttemptId">) | undefined;
    }, {
        userId: string;
        assessmentId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
        attemptId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "assessment.quiz.started";
    payload: {
        userId: string & z.BRAND<"UserId">;
        assessmentId: string & z.BRAND<"AssessmentId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
        attemptId?: (string & z.BRAND<"AttemptId">) | undefined;
    };
}, {
    eventName: "assessment.quiz.started";
    payload: {
        userId: string;
        assessmentId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
        attemptId?: string | undefined;
    };
}>;
/**
 * Event: assessment.quiz.submitted
 * Emitted by: assessment-service
 * Payload: IDs only (no score, no readiness)
 */
export interface AssessmentQuizSubmittedEvent {
    eventName: 'assessment.quiz.submitted';
    payload: {
        eventId: string;
        occurredAt: string;
        correlationId?: string;
        assessmentId: AssessmentId;
        userId: UserId;
    };
}
export declare const assessmentQuizSubmittedSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"assessment.quiz.submitted">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        correlationId: z.ZodOptional<z.ZodString>;
        assessmentId: z.ZodBranded<z.ZodString, "AssessmentId">;
        userId: z.ZodBranded<z.ZodString, "UserId">;
    }, "strip", z.ZodTypeAny, {
        userId: string & z.BRAND<"UserId">;
        assessmentId: string & z.BRAND<"AssessmentId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }, {
        userId: string;
        assessmentId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "assessment.quiz.submitted";
    payload: {
        userId: string & z.BRAND<"UserId">;
        assessmentId: string & z.BRAND<"AssessmentId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}, {
    eventName: "assessment.quiz.submitted";
    payload: {
        userId: string;
        assessmentId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}>;
/**
 * Event: assessment.level_test.completed
 * Emitted by: assessment-service
 * Payload: IDs only (no cefrLevel, no readiness)
 */
export interface AssessmentLevelTestCompletedEvent {
    eventName: 'assessment.level_test.completed';
    payload: {
        eventId: string;
        occurredAt: string;
        correlationId?: string;
        assessmentId: AssessmentId;
        userId: UserId;
    };
}
export declare const assessmentLevelTestCompletedSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"assessment.level_test.completed">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        correlationId: z.ZodOptional<z.ZodString>;
        assessmentId: z.ZodBranded<z.ZodString, "AssessmentId">;
        userId: z.ZodBranded<z.ZodString, "UserId">;
    }, "strip", z.ZodTypeAny, {
        userId: string & z.BRAND<"UserId">;
        assessmentId: string & z.BRAND<"AssessmentId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }, {
        userId: string;
        assessmentId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "assessment.level_test.completed";
    payload: {
        userId: string & z.BRAND<"UserId">;
        assessmentId: string & z.BRAND<"AssessmentId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}, {
    eventName: "assessment.level_test.completed";
    payload: {
        userId: string;
        assessmentId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}>;
//# sourceMappingURL=assessment.d.ts.map