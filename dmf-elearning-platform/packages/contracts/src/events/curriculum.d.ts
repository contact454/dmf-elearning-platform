/**
 * Curriculum domain events (Sự kiện miền Chương trình)
 *
 * From STEP 5C (event-contracts.md)
 * Frozen: Do not modify without architecture approval.
 *
 * IMPORTANT: Event payloads are IDs-only.
 */
import { z } from 'zod';
import type { EnrollmentId, UserId, CourseId, UnitId, SRSItemId } from '@dmf/shared';
/**
 * Event: curriculum.course.enrolled
 * Emitted by: curriculum-service
 * Payload: IDs only
 */
export interface CurriculumCourseEnrolledEvent {
    eventName: 'curriculum.course.enrolled';
    payload: {
        eventId: string;
        occurredAt: string;
        correlationId?: string;
        enrollmentId: EnrollmentId;
        userId: UserId;
        courseId: CourseId;
    };
}
export declare const curriculumCourseEnrolledSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"curriculum.course.enrolled">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        correlationId: z.ZodOptional<z.ZodString>;
        enrollmentId: z.ZodBranded<z.ZodString, "EnrollmentId">;
        userId: z.ZodBranded<z.ZodString, "UserId">;
        courseId: z.ZodBranded<z.ZodString, "CourseId">;
    }, "strip", z.ZodTypeAny, {
        userId: string & z.BRAND<"UserId">;
        courseId: string & z.BRAND<"CourseId">;
        eventId: string;
        occurredAt: string;
        enrollmentId: string & z.BRAND<"EnrollmentId">;
        correlationId?: string | undefined;
    }, {
        userId: string;
        courseId: string;
        eventId: string;
        occurredAt: string;
        enrollmentId: string;
        correlationId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "curriculum.course.enrolled";
    payload: {
        userId: string & z.BRAND<"UserId">;
        courseId: string & z.BRAND<"CourseId">;
        eventId: string;
        occurredAt: string;
        enrollmentId: string & z.BRAND<"EnrollmentId">;
        correlationId?: string | undefined;
    };
}, {
    eventName: "curriculum.course.enrolled";
    payload: {
        userId: string;
        courseId: string;
        eventId: string;
        occurredAt: string;
        enrollmentId: string;
        correlationId?: string | undefined;
    };
}>;
/**
 * Event: curriculum.unit.unlocked
 * Emitted by: progress-service
 * Payload: IDs only
 */
export interface CurriculumUnitUnlockedEvent {
    eventName: 'curriculum.unit.unlocked';
    payload: {
        eventId: string;
        occurredAt: string;
        correlationId?: string;
        userId: UserId;
        unitId: UnitId;
        courseId: CourseId;
    };
}
export declare const curriculumUnitUnlockedSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"curriculum.unit.unlocked">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        correlationId: z.ZodOptional<z.ZodString>;
        userId: z.ZodBranded<z.ZodString, "UserId">;
        unitId: z.ZodBranded<z.ZodString, "UnitId">;
        courseId: z.ZodBranded<z.ZodString, "CourseId">;
    }, "strip", z.ZodTypeAny, {
        userId: string & z.BRAND<"UserId">;
        courseId: string & z.BRAND<"CourseId">;
        unitId: string & z.BRAND<"UnitId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }, {
        userId: string;
        courseId: string;
        unitId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "curriculum.unit.unlocked";
    payload: {
        userId: string & z.BRAND<"UserId">;
        courseId: string & z.BRAND<"CourseId">;
        unitId: string & z.BRAND<"UnitId">;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}, {
    eventName: "curriculum.unit.unlocked";
    payload: {
        userId: string;
        courseId: string;
        unitId: string;
        eventId: string;
        occurredAt: string;
        correlationId?: string | undefined;
    };
}>;
/**
 * Event: curriculum.srs_items.due
 * Emitted by: curriculum-service
 * Payload: IDs only
 */
export interface CurriculumSrsItemsDueEvent {
    eventName: 'curriculum.srs_items.due';
    payload: {
        eventId: string;
        occurredAt: string;
        correlationId?: string;
        userId: UserId;
        courseId?: CourseId;
        dueItemIds: SRSItemId[];
    };
}
export declare const curriculumSrsItemsDueSchema: z.ZodObject<{
    eventName: z.ZodLiteral<"curriculum.srs_items.due">;
    payload: z.ZodObject<{
        eventId: z.ZodString;
        occurredAt: z.ZodString;
        correlationId: z.ZodOptional<z.ZodString>;
        userId: z.ZodBranded<z.ZodString, "UserId">;
        courseId: z.ZodOptional<z.ZodBranded<z.ZodString, "CourseId">>;
        dueItemIds: z.ZodArray<z.ZodBranded<z.ZodString, "SRSItemId">, "many">;
    }, "strip", z.ZodTypeAny, {
        userId: string & z.BRAND<"UserId">;
        eventId: string;
        occurredAt: string;
        dueItemIds: (string & z.BRAND<"SRSItemId">)[];
        correlationId?: string | undefined;
        courseId?: (string & z.BRAND<"CourseId">) | undefined;
    }, {
        userId: string;
        eventId: string;
        occurredAt: string;
        dueItemIds: string[];
        correlationId?: string | undefined;
        courseId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventName: "curriculum.srs_items.due";
    payload: {
        userId: string & z.BRAND<"UserId">;
        eventId: string;
        occurredAt: string;
        dueItemIds: (string & z.BRAND<"SRSItemId">)[];
        correlationId?: string | undefined;
        courseId?: (string & z.BRAND<"CourseId">) | undefined;
    };
}, {
    eventName: "curriculum.srs_items.due";
    payload: {
        userId: string;
        eventId: string;
        occurredAt: string;
        dueItemIds: string[];
        correlationId?: string | undefined;
        courseId?: string | undefined;
    };
}>;
//# sourceMappingURL=curriculum.d.ts.map