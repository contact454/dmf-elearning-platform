/**
 * Attempt Entity (Thực thể Attempt)
 * Owned write state - practice-service only
 */

export type AttemptId = string & { __brand: 'AttemptId' };
export type AttemptStatus = 'in-progress' | 'completed' | 'abandoned';

export interface Attempt {
  id: AttemptId;
  userId: string; // UserId from shared
  lessonId: string; // LessonId from shared
  status: AttemptStatus;
  startedAt: Date;
  completedAt?: Date;
  abandonedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
