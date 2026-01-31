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
    occurredAt: string; // ISO 8601
    correlationId?: string;
    enrollmentId: EnrollmentId;
    userId: UserId;
    courseId: CourseId;
  };
}

export const curriculumCourseEnrolledSchema = z.object({
  eventName: z.literal('curriculum.course.enrolled'),
  payload: z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    correlationId: z.string().optional(),
    enrollmentId: z.string().brand<'EnrollmentId'>(),
    userId: z.string().brand<'UserId'>(),
    courseId: z.string().brand<'CourseId'>(),
  }),
});

/**
 * Event: curriculum.unit.unlocked
 * Emitted by: progress-service
 * Payload: IDs only
 */
export interface CurriculumUnitUnlockedEvent {
  eventName: 'curriculum.unit.unlocked';
  payload: {
    eventId: string;
    occurredAt: string; // ISO 8601
    correlationId?: string;
    userId: UserId;
    unitId: UnitId;
    courseId: CourseId;
  };
}

export const curriculumUnitUnlockedSchema = z.object({
  eventName: z.literal('curriculum.unit.unlocked'),
  payload: z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    correlationId: z.string().optional(),
    userId: z.string().brand<'UserId'>(),
    unitId: z.string().brand<'UnitId'>(),
    courseId: z.string().brand<'CourseId'>(),
  }),
});

/**
 * Event: curriculum.srs_items.due
 * Emitted by: curriculum-service
 * Payload: IDs only
 */
export interface CurriculumSrsItemsDueEvent {
  eventName: 'curriculum.srs_items.due';
  payload: {
    eventId: string;
    occurredAt: string; // ISO 8601
    correlationId?: string;
    userId: UserId;
    courseId?: CourseId;
    dueItemIds: SRSItemId[];
  };
}

export const curriculumSrsItemsDueSchema = z.object({
  eventName: z.literal('curriculum.srs_items.due'),
  payload: z.object({
    eventId: z.string(),
    occurredAt: z.string(),
    correlationId: z.string().optional(),
    userId: z.string().brand<'UserId'>(),
    courseId: z.string().brand<'CourseId'>().optional(),
    dueItemIds: z.array(z.string().brand<'SRSItemId'>()),
  }),
});
