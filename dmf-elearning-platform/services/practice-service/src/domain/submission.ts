/**
 * Submission Entity (Thực thể Submission)
 * Owned write state - practice-service only
 */

export type SubmissionId = string & { __brand: 'SubmissionId' };
export type SubmissionType = 'speaking' | 'writing' | 'quiz' | 'listening';

export interface Submission {
  id: SubmissionId;
  attemptId: string; // AttemptId
  activityId: string; // ActivityId
  type: SubmissionType;
  audioUrl?: string; // Required if type='speaking'
  text?: string; // Required if type='writing'
  answer?: string; // Required if type='quiz' or 'listening'
  createdAt: Date;
  updatedAt: Date;
}
