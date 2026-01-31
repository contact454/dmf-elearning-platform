/**
 * Enums (Liệt kê)
 * 
 * These enums are defined based on frozen architecture docs.
 * Do not add new values without architecture approval.
 */

/**
 * User roles (Vai trò người dùng)
 * From STEP 8B (authz-matrix.md)
 */
export enum UserRole {
  LEARNER = 'learner',
  TEACHER = 'teacher',
  MENTOR = 'mentor',
  ADMIN = 'admin',
  SYSTEM = 'system',
}

/**
 * Skill types (Loại kỹ năng)
 * From frozen docs (referenced in read-model-inventory.md)
 */
export enum SkillType {
  GRAMMAR = 'grammar',
  VOCABULARY = 'vocabulary',
  SPEAKING = 'speaking',
  LISTENING = 'listening',
  READING = 'reading',
  WRITING = 'writing',
}

/**
 * Attempt status (Trạng thái nỗ lực)
 * From state-models.md
 */
export enum AttemptStatus {
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

/**
 * Submission type (Loại nộp bài)
 * From state-models.md
 */
export enum SubmissionType {
  QUIZ = 'quiz',
  LISTENING = 'listening',
  SPEAKING = 'speaking',
  WRITING = 'writing',
}

/**
 * Assessment status (Trạng thái đánh giá)
 * From state-models.md
 */
export enum AssessmentStatus {
  IN_PROGRESS = 'in-progress',
  GRADED = 'graded',
}

/**
 * Feedback request status (Trạng thái yêu cầu phản hồi)
 * From state-models.md
 */
export enum FeedbackRequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
}

/**
 * Feedback author role (Vai trò tác giả phản hồi)
 * From command-contracts.md
 */
export enum FeedbackAuthorRole {
  TEACHER = 'teacher',
  MENTOR = 'mentor',
  AI = 'ai',
}

/**
 * CEFR Levels (Trình độ CEFR)
 */
export enum CEFRLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

/**
 * Language codes (Mã ngôn ngữ)
 */
export enum LanguageCode {
  DE = 'de',
  EN = 'en',
  VI = 'vi',
}
