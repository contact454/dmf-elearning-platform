import { UnitId, CourseId, EnrollmentId, SRSItemId } from '../ids';
import { DomainEvent } from './envelope';

/**
 * Curriculum Domain Event Payloads
 */

export interface UnitUnlockedPayload {
    unitId: UnitId;
    courseId: CourseId;
    reason: 'mastery' | 'assessment' | 'manual' | 'srs'; // Required for anti "học ảo" measurement
}

export interface CourseEnrolledPayload {
    enrollmentId: EnrollmentId;
    courseId: CourseId;
}

export interface SRSItemsDuePayload {
    itemIds: SRSItemId[];
    count: number;
}

/**
 * Curriculum Domain Events
 */
export type CurriculumEvent =
    | DomainEvent<'curriculum.unit.unlocked', UnitUnlockedPayload>
    | DomainEvent<'curriculum.course.enrolled', CourseEnrolledPayload>
    | DomainEvent<'curriculum.srs_items.due', SRSItemsDuePayload>;
