/**
 * Review Creation Consumer (Người tiêu dùng Tạo Đánh giá)
 * 
 * Auto-creates reviews when evidence needs review.
 */

import type { EventBus, Logger } from '@dmf/infra';
import { getEvidenceReviewRegistry } from '@dmf/evidence';
import { calculateExpirationDate, REVIEW_SLA_HOURS } from '@dmf/evidence';
import type { Event } from '@dmf/infra';

// Generate review ID helper
function generateReviewId(): string {
  return `rev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Evidence types that require review
 */
const REVIEW_REQUIRED_TYPES = ['speaking', 'writing', 'teacher_validation'];

/**
 * Determine reviewer role based on evidence type
 */
function getReviewerRole(evidenceType: string): 'teacher' | 'mentor' {
  if (evidenceType === 'teacher_validation') {
    return 'teacher';
  }
  // Default: teacher (can be extended to mentor for specific types)
  return 'teacher';
}

/**
 * Setup review creation consumer
 */
export function setupReviewCreationConsumer(eventBus: EventBus, logger: Logger): void {
  // Listen to evidence.created event
  eventBus.subscribe('evidence.created', async (event: Event) => {
    try {
      const payload = event.payload as any;
      const evidenceType = payload.type as string;

      // Check if this evidence type requires review
      if (!REVIEW_REQUIRED_TYPES.includes(evidenceType)) {
        return; // No review needed
      }

      const registry = getEvidenceReviewRegistry();

      // Check if review already exists
      const existingReview = registry.getReviewByEvidenceId(payload.evidenceId);
      if (existingReview) {
        return; // Already has review
      }

      // Create review
      const reviewId = generateReviewId();
      const reviewerRole = getReviewerRole(evidenceType);
      const expiresAt = calculateExpirationDate(payload.occurredAt || new Date().toISOString(), REVIEW_SLA_HOURS);

      registry.createReview({
        reviewId,
        evidenceId: payload.evidenceId,
        reviewerId: undefined, // Not claimed yet (pull-based)
        reviewerRole,
        status: 'pending',
        createdAt: payload.occurredAt || new Date().toISOString(),
        expiresAt,
        userId: payload.userId,
        lessonId: payload.lessonId,
        courseId: payload.courseId,
        evidenceType,
      });

      logger.info('Review created for evidence', {
        reviewId,
        evidenceId: payload.evidenceId,
        evidenceType,
        reviewerRole,
        expiresAt,
      });
    } catch (error: any) {
      logger.error('Failed to create review for evidence', error);
    }
  });
}
