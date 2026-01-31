/**
 * Enums re-export (Xuất lại Enums)
 * 
 * This file re-exports enums from the canonical location (./types/enums.ts)
 * to maintain backward compatibility with internal imports from '../enums'.
 * 
 * All enums should be defined in ./types/enums.ts and re-exported here.
 */

// Re-export canonical enums (Xuất lại enums chính thức)
export {
  UserRole,
  SkillType,
  AttemptStatus,
  SubmissionType,
  AssessmentStatus,
  FeedbackRequestStatus,
  FeedbackAuthorRole,
  LanguageCode,
} from '../types/enums';

// Legacy enums that may be used internally but not exported from main index
// These are kept for internal compatibility only
// Note: These may not be in the canonical enums file, so we define them here
// If they are needed externally, they should be added to ./types/enums.ts

export enum CEFRLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export enum FeedbackAuthor {
  AI = 'ai',
  TEACHER = 'teacher',
  MENTOR = 'mentor',
}

export enum ActivityType {
  MULTIPLE_CHOICE = 'multiple-choice',
  FILL_GAP = 'fill-gap',
  SPEAKING = 'speaking',
  LISTENING = 'listening',
}

export enum ReadinessStatus {
  NOT_READY = 'not_ready',
  ALMOST_READY = 'almost_ready',
  READY = 'ready',
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
}

export enum AssessmentType {
  PLACEMENT = 'placement',
  UNIT_TEST = 'unit-test',
  LEVEL_EXAM = 'level-exam',
}
