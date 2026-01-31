/**
 * Shared package exports (Xuất gói Dùng chung)
 * 
 * This package contains type definitions only (NO business logic).
 * All exports are types, enums, and helper functions.
 */

// ID types
export * from './types/ids';

// Enums (explicit export to avoid conflicts)
export {
  UserRole,
  SkillType,
  AttemptStatus,
  SubmissionType,
  AssessmentStatus,
  FeedbackRequestStatus,
  FeedbackAuthorRole,
  CEFRLevel,
  LanguageCode,
} from './types/enums';

// Authz helpers (explicit export to avoid UserRole conflict)
export {
  forbidRole,
  failOwnership,
  checkOwnership,
} from './authz';

// Error helpers
export * from './errors';

// HTTP helpers
export * from './http/request-context';
export * from './http/middlewares';

// Audit helpers
export * from './audit/audit';

// Policy helpers
export * from './policy/hard-gate-policy-registry';

// Ops helpers (interfaces to break cyclic dependencies)
export * from './ops/evidence-review-registry.interface';
