/**
 * Branded ID types (Loại ID có nhãn)
 * 
 * These types prevent mixing different ID types and ensure type safety.
 * All IDs are strings, but branded to prevent accidental mixing.
 */

// Base branded type helper
type Brand<T, B> = T & { __brand: B };

// User IDs
export type UserId = Brand<string, 'UserId'>;
export type SessionId = Brand<string, 'SessionId'>;

// Learning IDs
export type LessonId = Brand<string, 'LessonId'>;
export type UnitId = Brand<string, 'UnitId'>;
export type CourseId = Brand<string, 'CourseId'>;
export type AttemptId = Brand<string, 'AttemptId'>;
export type SubmissionId = Brand<string, 'SubmissionId'>;
export type ActivityId = Brand<string, 'ActivityId'>;

// Assessment IDs
export type AssessmentId = Brand<string, 'AssessmentId'>;
export type QuizId = Brand<string, 'QuizId'>;

// Mentoring IDs
export type FeedbackId = Brand<string, 'FeedbackId'>;
export type FeedbackRequestId = Brand<string, 'FeedbackRequestId'>;

// Curriculum IDs
export type EnrollmentId = Brand<string, 'EnrollmentId'>;
export type SRSItemId = Brand<string, 'SRSItemId'>;

// Progress IDs
export type ProgressStateId = Brand<string, 'ProgressStateId'>;
export type MasteryStateId = Brand<string, 'MasteryStateId'>;
export type SkillScoreId = Brand<string, 'SkillScoreId'>;

// Readiness IDs
export type ReadinessStateId = Brand<string, 'ReadinessStateId'>;

// Language codes
export type LanguageCode = Brand<string, 'LanguageCode'>;
