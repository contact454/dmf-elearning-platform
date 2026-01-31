import { AssessmentId, AttemptId } from '../ids';
import { CEFRLevel } from '../enums';
import { DomainEvent } from './envelope';

/**
 * Assessment Domain Event Payloads
 */

export interface QuizStartedPayload {
    assessmentId: AssessmentId;
    attemptId?: AttemptId;
}

export interface QuizSubmittedPayload {
    assessmentId: AssessmentId;
    attemptId?: AttemptId;
    score: number; // Required for anti "học ảo" measurement (0-100)
    levelHint?: CEFRLevel; // Optional: inferred level from assessment
}

export interface LevelTestCompletedPayload {
    assessmentId: AssessmentId;
    attemptId?: AttemptId;
    finalGrade?: number; // 0-100
}

/**
 * Assessment Domain Events
 */
export type AssessmentEvent =
    | DomainEvent<'assessment.quiz.started', QuizStartedPayload>
    | DomainEvent<'assessment.quiz.submitted', QuizSubmittedPayload>
    | DomainEvent<'assessment.level_test.completed', LevelTestCompletedPayload>;
