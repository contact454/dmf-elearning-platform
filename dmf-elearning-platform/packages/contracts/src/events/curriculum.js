/**
 * Curriculum domain events (Sự kiện miền Chương trình)
 *
 * From STEP 5C (event-contracts.md)
 * Frozen: Do not modify without architecture approval.
 *
 * IMPORTANT: Event payloads are IDs-only.
 */
import { z } from 'zod';
export const curriculumCourseEnrolledSchema = z.object({
    eventName: z.literal('curriculum.course.enrolled'),
    payload: z.object({
        eventId: z.string(),
        occurredAt: z.string(),
        correlationId: z.string().optional(),
        enrollmentId: z.string().brand(),
        userId: z.string().brand(),
        courseId: z.string().brand(),
    }),
});
export const curriculumUnitUnlockedSchema = z.object({
    eventName: z.literal('curriculum.unit.unlocked'),
    payload: z.object({
        eventId: z.string(),
        occurredAt: z.string(),
        correlationId: z.string().optional(),
        userId: z.string().brand(),
        unitId: z.string().brand(),
        courseId: z.string().brand(),
    }),
});
export const curriculumSrsItemsDueSchema = z.object({
    eventName: z.literal('curriculum.srs_items.due'),
    payload: z.object({
        eventId: z.string(),
        occurredAt: z.string(),
        correlationId: z.string().optional(),
        userId: z.string().brand(),
        courseId: z.string().brand().optional(),
        dueItemIds: z.array(z.string().brand()),
    }),
});
//# sourceMappingURL=curriculum.js.map