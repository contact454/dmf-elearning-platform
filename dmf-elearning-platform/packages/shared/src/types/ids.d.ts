/**
 * Branded ID types (Loại ID có nhãn)
 *
 * These types prevent mixing different ID types and ensure type safety.
 * All IDs are strings, but branded to prevent accidental mixing.
 */
type Brand<T, B> = T & {
    __brand: B;
};
export type UserId = Brand<string, 'UserId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type LessonId = Brand<string, 'LessonId'>;
export type UnitId = Brand<string, 'UnitId'>;
export type CourseId = Brand<string, 'CourseId'>;
export type AttemptId = Brand<string, 'AttemptId'>;
export type SubmissionId = Brand<string, 'SubmissionId'>;
export type ActivityId = Brand<string, 'ActivityId'>;
export type AssessmentId = Brand<string, 'AssessmentId'>;
export type QuizId = Brand<string, 'QuizId'>;
export type FeedbackId = Brand<string, 'FeedbackId'>;
export type FeedbackRequestId = Brand<string, 'FeedbackRequestId'>;
export type EnrollmentId = Brand<string, 'EnrollmentId'>;
export type SRSItemId = Brand<string, 'SRSItemId'>;
export type ProgressStateId = Brand<string, 'ProgressStateId'>;
export type MasteryStateId = Brand<string, 'MasteryStateId'>;
export type SkillScoreId = Brand<string, 'SkillScoreId'>;
export type ReadinessStateId = Brand<string, 'ReadinessStateId'>;
export type LanguageCode = Brand<string, 'LanguageCode'>;
export {};
//# sourceMappingURL=ids.d.ts.map