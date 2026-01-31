/**
 * Evidence Review Registry (Đăng ký Đánh giá Bằng chứng)
 * 
 * In-memory review store with queue management.
 */

import type { EvidenceReview, ReviewQueueItem, EvidenceReviewStatus, ReviewerRole } from './evidence-review.js';
import type { UserId } from '@dmf/shared';
import { setEvidenceReviewRegistryProvider, type EvidenceReviewRegistry as IEvidenceReviewRegistry } from '@dmf/shared';

class EvidenceReviewRegistry {
  private reviews = new Map<string, EvidenceReview>(); // reviewId -> EvidenceReview
  private evidenceToReview = new Map<string, string>(); // evidenceId -> reviewId
  private userReviews = new Map<string, string[]>(); // userId -> reviewId[]
  private reviewerReviews = new Map<string, string[]>(); // reviewerId -> reviewId[]

  /**
   * Create review (auto-created when evidence needs review)
   */
  createReview(review: EvidenceReview): void {
    // Check if review already exists for this evidence
    const existingReviewId = this.evidenceToReview.get(review.evidenceId);
    if (existingReviewId && this.reviews.has(existingReviewId)) {
      return; // Already exists
    }

    // Store review
    this.reviews.set(review.reviewId, review);
    this.evidenceToReview.set(review.evidenceId, review.reviewId);

    // Update user index
    const userReviewIds = this.userReviews.get(review.userId) || [];
    userReviewIds.push(review.reviewId);
    this.userReviews.set(review.userId, userReviewIds);

    // Update reviewer index (if claimed)
    if (review.reviewerId) {
      const reviewerReviewIds = this.reviewerReviews.get(review.reviewerId) || [];
      reviewerReviewIds.push(review.reviewId);
      this.reviewerReviews.set(review.reviewerId, reviewerReviewIds);
    }
  }

  /**
   * Get review by ID
   */
  getReview(reviewId: string): EvidenceReview | null {
    return this.reviews.get(reviewId) || null;
  }

  /**
   * Get review by evidence ID
   */
  getReviewByEvidenceId(evidenceId: string): EvidenceReview | null {
    const reviewId = this.evidenceToReview.get(evidenceId);
    if (!reviewId) {
      return null;
    }
    return this.reviews.get(reviewId) || null;
  }

  /**
   * Update review status
   */
  updateReviewStatus(
    reviewId: string,
    status: EvidenceReviewStatus,
    reviewerId?: UserId,
    comment?: string
  ): EvidenceReview | null {
    const review = this.reviews.get(reviewId);
    if (!review) {
      return null;
    }

    const updated: EvidenceReview = {
      ...review,
      status,
      reviewedAt: new Date().toISOString(),
      comment,
    };

    if (reviewerId) {
      updated.reviewerId = reviewerId;

      // Update reviewer index
      if (!review.reviewerId) {
        // First time claiming
        const reviewerReviewIds = this.reviewerReviews.get(reviewerId) || [];
        reviewerReviewIds.push(reviewId);
        this.reviewerReviews.set(reviewerId, reviewerReviewIds);
      }
    }

    this.reviews.set(reviewId, updated);
    return updated;
  }

  /**
   * Get review queue (pending reviews)
   */
  getReviewQueue(filters?: {
    reviewerRole?: ReviewerRole;
    courseId?: string;
    lessonId?: string;
    status?: EvidenceReviewStatus;
  }): ReviewQueueItem[] {
    const allReviews = Array.from(this.reviews.values());

    let filtered = allReviews;

    // Filter by status
    if (filters?.status) {
      filtered = filtered.filter((r) => r.status === filters.status);
    } else {
      // Default: pending
      filtered = filtered.filter((r) => r.status === 'pending');
    }

    // Filter by reviewer role
    if (filters?.reviewerRole) {
      filtered = filtered.filter((r) => r.reviewerRole === filters.reviewerRole);
    }

    // Filter by course
    if (filters?.courseId) {
      filtered = filtered.filter((r) => r.courseId === filters.courseId);
    }

    // Filter by lesson
    if (filters?.lessonId) {
      filtered = filtered.filter((r) => r.lessonId === filters.lessonId);
    }

    // Convert to queue items
    return filtered.map((review) => ({
      reviewId: review.reviewId,
      evidenceId: review.evidenceId,
      evidenceType: review.evidenceType,
      learnerId: review.userId,
      lessonId: review.lessonId,
      courseId: review.courseId,
      submittedAt: review.createdAt,
      expiresAt: review.expiresAt,
      reviewerRole: review.reviewerRole,
      status: review.status,
      claimedBy: review.reviewerId,
    }));
  }

  /**
   * Get reviews by reviewer
   */
  getReviewsByReviewer(reviewerId: UserId): EvidenceReview[] {
    const reviewIds = this.reviewerReviews.get(reviewerId) || [];
    return reviewIds
      .map((id) => this.reviews.get(id))
      .filter((r): r is EvidenceReview => r !== undefined);
  }

  /**
   * Get reviews by user (learner)
   */
  getReviewsByUser(userId: UserId): EvidenceReview[] {
    const reviewIds = this.userReviews.get(userId) || [];
    return reviewIds
      .map((id) => this.reviews.get(id))
      .filter((r): r is EvidenceReview => r !== undefined);
  }

  /**
   * Get expired reviews (for SLA job)
   */
  getExpiredReviews(): EvidenceReview[] {
    const now = new Date();
    return Array.from(this.reviews.values()).filter((review) => {
      if (review.status !== 'pending') {
        return false;
      }
      if (!review.expiresAt) {
        return false;
      }
      return new Date(review.expiresAt) < now;
    });
  }
}

// Singleton instance
let registryInstance: EvidenceReviewRegistry | null = null;

export function getEvidenceReviewRegistry(): EvidenceReviewRegistry {
  if (!registryInstance) {
    registryInstance = new EvidenceReviewRegistry();
  }
  return registryInstance;
}

// Register with shared package to break cyclic dependency
// This allows @dmf/ops to get the registry without importing from @dmf/evidence
setEvidenceReviewRegistryProvider(() => {
  const registry = getEvidenceReviewRegistry();
  // Adapter to match interface expected by @dmf/shared
  return {
    getReviewQueue(filter?: {
      status?: EvidenceReviewStatus;
      reviewerRole?: ReviewerRole;
      courseId?: string;
      lessonId?: string;
    }): Array<{
      reviewId: string;
      evidenceId: string;
      userId: string;
      reviewerId?: string;
      reviewerRole?: ReviewerRole;
      status: EvidenceReviewStatus;
      courseId?: string;
      lessonId?: string;
      submittedAt?: string;
      createdAt?: string;
      reviewedAt?: string;
      expiresAt?: string;
    }> {
      const items = registry.getReviewQueue(filter);
      return items.map((item) => ({
        reviewId: item.reviewId,
        evidenceId: item.evidenceId,
        userId: item.learnerId,
        reviewerId: item.claimedBy,
        reviewerRole: item.reviewerRole,
        status: item.status,
        courseId: item.courseId,
        lessonId: item.lessonId,
        submittedAt: item.submittedAt,
        createdAt: item.submittedAt, // Use submittedAt as createdAt fallback
        expiresAt: item.expiresAt,
      }));
    },
  } as IEvidenceReviewRegistry;
});
