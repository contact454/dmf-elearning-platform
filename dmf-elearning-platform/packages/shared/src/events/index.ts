/**
 * Domain Events
 * Typed event definitions for the DMF E-Learning Platform
 */

export * from './envelope';
export * from './catalog';
export * from './learning';
export * from './assessment';
export * from './curriculum';
export * from './mentoring';
export * from './system';

/**
 * Union of all domain events
 */
import { LearningEvent } from './learning';
import { AssessmentEvent } from './assessment';
import { CurriculumEvent } from './curriculum';
import { MentoringEvent } from './mentoring';
import { SystemEvent } from './system';

export type DomainEventUnion =
    | LearningEvent
    | AssessmentEvent
    | CurriculumEvent
    | MentoringEvent
    | SystemEvent;
