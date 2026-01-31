/**
 * Curriculum domain commands (Lệnh miền Chương trình)
 *
 * From STEP 4.2 (command-contracts.md)
 * Frozen: Do not modify without architecture approval.
 */
import { z } from 'zod';
export const curriculumCourseEnrollSchema = z.object({
    userId: z.string().brand(),
    courseId: z.string().brand(),
    correlationId: z.string().optional(),
});
export const curriculumUnitAccessSchema = z.object({
    userId: z.string().brand(),
    unitId: z.string().brand(),
    correlationId: z.string().optional(),
});
//# sourceMappingURL=curriculum.js.map