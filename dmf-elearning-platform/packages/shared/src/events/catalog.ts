/**
 * Event Name Catalog
 * Union of all event names from contracts/events/events.catalog.md
 * Format: domain.entity.action
 */

// Learning Domain
export type LearningEventName =
    | 'learning.lesson.started'
    | 'learning.lesson.completed'
    | 'learning.lesson.abandoned'
    | 'learning.submission.created';

// Assessment Domain
export type AssessmentEventName =
    | 'assessment.quiz.started'
    | 'assessment.quiz.submitted'
    | 'assessment.level_test.completed';

// Curriculum Domain
export type CurriculumEventName =
    | 'curriculum.unit.unlocked'
    | 'curriculum.course.enrolled'
    | 'curriculum.srs_items.due';

// Mentoring Domain
export type MentoringEventName =
    | 'mentoring.feedback.requested'
    | 'mentoring.feedback.published';

// System/User Domain
export type SystemEventName =
    | 'system.user.registered'
    | 'system.user.login'
    | 'system.profile.updated';

/**
 * Union of all event names
 */
export type EventName =
    | LearningEventName
    | AssessmentEventName
    | CurriculumEventName
    | MentoringEventName
    | SystemEventName;
