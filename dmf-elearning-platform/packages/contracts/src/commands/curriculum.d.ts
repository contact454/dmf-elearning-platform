/**
 * Curriculum domain commands (Lệnh miền Chương trình)
 *
 * From STEP 4.2 (command-contracts.md)
 * Frozen: Do not modify without architecture approval.
 */
import { z } from 'zod';
import type { UserId, CourseId, UnitId } from '@dmf/shared';
/**
 * Command: curriculum.course.enroll
 * Handled by: curriculum-service
 */
export interface CurriculumCourseEnrollCommand {
    userId: UserId;
    courseId: CourseId;
    correlationId?: string;
}
export declare const curriculumCourseEnrollSchema: z.ZodObject<{
    userId: z.ZodBranded<z.ZodString, "UserId">;
    courseId: z.ZodBranded<z.ZodString, "CourseId">;
    correlationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string & z.BRAND<"UserId">;
    courseId: string & z.BRAND<"CourseId">;
    correlationId?: string | undefined;
}, {
    userId: string;
    courseId: string;
    correlationId?: string | undefined;
}>;
/**
 * Command: curriculum.unit.access
 * Handled by: progress-service (internal system command)
 * Note: This is an internal command, not exposed to clients.
 */
export interface CurriculumUnitAccessCommand {
    userId: UserId;
    unitId: UnitId;
    correlationId?: string;
}
export declare const curriculumUnitAccessSchema: z.ZodObject<{
    userId: z.ZodBranded<z.ZodString, "UserId">;
    unitId: z.ZodBranded<z.ZodString, "UnitId">;
    correlationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string & z.BRAND<"UserId">;
    unitId: string & z.BRAND<"UnitId">;
    correlationId?: string | undefined;
}, {
    userId: string;
    unitId: string;
    correlationId?: string | undefined;
}>;
//# sourceMappingURL=curriculum.d.ts.map