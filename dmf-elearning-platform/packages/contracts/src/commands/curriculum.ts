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

export const curriculumCourseEnrollSchema = z.object({
  userId: z.string().brand<'UserId'>(),
  courseId: z.string().brand<'CourseId'>(),
  correlationId: z.string().optional(),
});

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

export const curriculumUnitAccessSchema = z.object({
  userId: z.string().brand<'UserId'>(),
  unitId: z.string().brand<'UnitId'>(),
  correlationId: z.string().optional(),
});
