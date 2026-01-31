/**
 * SLA Expiration Job (Công việc Hết hạn SLA)
 * 
 * Checks for expired reviews and marks them as expired.
 */

import type { EventBus, Logger, AuditLogger } from '@dmf/infra';
import { getEvidenceReviewRegistry, isReviewExpired } from '@dmf/evidence';

// Generate event ID helper
function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check for expired reviews and process them
 */
export async function processExpiredReviews(
  eventBus: EventBus,
  logger: Logger,
  auditLogger: AuditLogger
): Promise<void> {
  try {
    const registry = getEvidenceReviewRegistry();
    const expiredReviews = registry.getExpiredReviews();

    for (const review of expiredReviews) {
      if (!isReviewExpired(review)) {
        continue; // Skip if not actually expired
      }

      // Mark as expired
      const updated = registry.updateReviewStatus(review.reviewId, 'expired');

      if (!updated) {
        logger.error('Failed to mark review as expired', undefined, { reviewId: review.reviewId });
        continue;
      }

      // Emit expired event
      await eventBus.emit({
        eventName: 'evidence.review.expired',
        payload: {
          eventId: generateEventId(),
          occurredAt: new Date().toISOString(),
          reviewId: review.reviewId,
          evidenceId: review.evidenceId,
          userId: review.userId,
          lessonId: review.lessonId,
          reviewerRole: review.reviewerRole,
        },
      });

      // Check if escalation needed (B1/B2 milestone)
      // For now, escalate all expired reviews (can be refined)
      const shouldEscalate = true; // TODO: Check if B1/B2 milestone

      if (shouldEscalate) {
        await eventBus.emit({
          eventName: 'evidence.review.escalated',
          payload: {
            eventId: generateEventId(),
            occurredAt: new Date().toISOString(),
            reviewId: review.reviewId,
            evidenceId: review.evidenceId,
            userId: review.userId,
            lessonId: review.lessonId,
            reviewerRole: review.reviewerRole,
            reason: 'SLA breach - review expired',
          },
        });

        logger.warn('Review escalated due to SLA breach', {
          reviewId: review.reviewId,
          evidenceId: review.evidenceId,
        });
      }

      // Audit log
      auditLogger.logCommandReceived('evidence.review.expire', 'system', review.reviewId);

      logger.info('Review marked as expired', {
        reviewId: review.reviewId,
        evidenceId: review.evidenceId,
      });
    }

    if (expiredReviews.length > 0) {
      logger.info(`Processed ${expiredReviews.length} expired reviews`);
    }
  } catch (error: any) {
    logger.error('SLA expiration job failed', error);
  }
}

/**
 * Setup SLA expiration job (runs periodically)
 * 
 * In production, this would be a cron job or scheduled task.
 * For now, it's called manually or on service start.
 */
export function setupSlaExpirationJob(
  eventBus: EventBus,
  logger: Logger,
  auditLogger: AuditLogger,
  intervalMs: number = 60 * 60 * 1000 // Default: 1 hour
): NodeJS.Timeout {
  // Run immediately
  processExpiredReviews(eventBus, logger, auditLogger);

  // Then run periodically
  return setInterval(() => {
    processExpiredReviews(eventBus, logger, auditLogger);
  }, intervalMs);
}
