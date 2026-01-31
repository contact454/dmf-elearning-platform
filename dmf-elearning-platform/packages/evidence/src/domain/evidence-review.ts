/**
 * Evidence Review Domain (Miền Đánh giá Bằng chứng)
 * 
 * Entity for teacher/mentor review workflow.
 */

import type { UserId } from '@dmf/shared';

export type EvidenceReviewStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type ReviewerRole = 'teacher' | 'mentor';

/**
 * Evidence Review (Đánh giá Bằng chứng)
 * 
 * Represents a review task for teacher/mentor.
 */
export interface EvidenceReview {
  reviewId: string;
  evidenceId: string;
  reviewerId?: UserId;
  reviewerRole: ReviewerRole;
  status: EvidenceReviewStatus;
  comment?: string;
  createdAt: string; // ISO 8601
  reviewedAt?: string; // ISO 8601
  expiresAt?: string; // ISO 8601
  // Context for reviewer
  userId: UserId; // Learner ID
  lessonId?: string;
  courseId?: string;
  evidenceType: string;
}

/**
 * Review Queue Item (Mục Hàng đợi Đánh giá)
 * 
 * Read model for review queue display.
 */
export interface ReviewQueueItem {
  reviewId: string;
  evidenceId: string;
  evidenceType: string;
  learnerId: UserId;
  lessonId?: string;
  courseId?: string;
  submittedAt: string; // When evidence was created
  expiresAt?: string;
  reviewerRole: ReviewerRole;
  status: EvidenceReviewStatus;
  claimedBy?: UserId;
}
