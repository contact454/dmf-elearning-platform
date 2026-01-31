/**
 * Review Commands Routes
 * 
 * POST /api/evidence/reviews/:reviewId/claim
 * POST /api/evidence/reviews/:reviewId/approve
 * POST /api/evidence/reviews/:reviewId/reject
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { Logger, EventBus, AuditLogger } from '@dmf/infra';
import { getEvidenceReviewRegistry } from '@dmf/evidence';
import type { UserId } from '@dmf/shared';

// Generate event ID helper
function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function registerReviewCommandsRoutes(
  app: FastifyInstance,
  deps: { logger: Logger; eventBus: EventBus; auditLogger: AuditLogger }
) {
  // Claim review
  app.post('/api/evidence/reviews/:reviewId/claim', async (request: FastifyRequest, reply: FastifyReply) => {
    const reviewId = (request.params as any).reviewId as string;
    const actorUserId = (request as any).requestContext?.userId as UserId | undefined;

    if (!actorUserId) {
      return reply.code(401).send({
        error: {
          code: 'UNAUTHORIZED',
          category: 'ClientError',
          message: 'Authentication required',
        },
      });
    }

    try {
      const registry = getEvidenceReviewRegistry();
      const review = registry.getReview(reviewId);

      if (!review) {
        return reply.code(404).send({
          error: {
            code: 'NOT_FOUND',
            category: 'ClientError',
            message: `Review ${reviewId} not found`,
          },
        });
      }

      if (review.status !== 'pending') {
        return reply.code(400).send({
          error: {
            code: 'INVALID_STATE',
            category: 'ClientError',
            message: `Review is not pending (current status: ${review.status})`,
          },
        });
      }

      if (review.reviewerId) {
        return reply.code(409).send({
          error: {
            code: 'ALREADY_CLAIMED',
            category: 'ClientError',
            message: `Review already claimed by ${review.reviewerId}`,
          },
        });
      }

      // Claim review
      const updated = registry.updateReviewStatus(reviewId, 'pending', actorUserId);

      if (!updated) {
        return reply.code(500).send({
          error: {
            code: 'INTERNAL_ERROR',
            category: 'TransientFailure',
            message: 'Failed to claim review',
          },
        });
      }

      // Audit log
      deps.auditLogger.logCommandReceived('evidence.review.claim', actorUserId, reviewId);

      return reply.code(200).send({
        review: {
          reviewId: updated.reviewId,
          evidenceId: updated.evidenceId,
          status: updated.status,
          reviewerId: updated.reviewerId,
        },
      });
    } catch (error: any) {
      deps.logger.error('Claim review failed', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: error.message || 'Internal server error',
        },
      });
    }
  });

  // Approve review
  app.post('/api/evidence/reviews/:reviewId/approve', async (request: FastifyRequest, reply: FastifyReply) => {
    const reviewId = (request.params as any).reviewId as string;
    const body = request.body as any;
    const actorUserId = (request as any).requestContext?.userId as UserId | undefined;

    if (!actorUserId) {
      return reply.code(401).send({
        error: {
          code: 'UNAUTHORIZED',
          category: 'ClientError',
          message: 'Authentication required',
        },
      });
    }

    try {
      const registry = getEvidenceReviewRegistry();
      const review = registry.getReview(reviewId);

      if (!review) {
        return reply.code(404).send({
          error: {
            code: 'NOT_FOUND',
            category: 'ClientError',
            message: `Review ${reviewId} not found`,
          },
        });
      }

      if (review.status !== 'pending') {
        return reply.code(400).send({
          error: {
            code: 'INVALID_STATE',
            category: 'ClientError',
            message: `Review is not pending (current status: ${review.status})`,
          },
        });
      }

      // Check ownership (must be claimed by this reviewer)
      if (review.reviewerId && review.reviewerId !== actorUserId) {
        return reply.code(403).send({
          error: {
            code: 'FORBIDDEN',
            category: 'ClientError',
            message: 'Review is claimed by another reviewer',
          },
        });
      }

      // Approve review
      const updated = registry.updateReviewStatus(reviewId, 'approved', actorUserId, body.comment);

      if (!updated) {
        return reply.code(500).send({
          error: {
            code: 'INTERNAL_ERROR',
            category: 'TransientFailure',
            message: 'Failed to approve review',
          },
        });
      }

      // Emit event
      await deps.eventBus.emit({
        eventName: 'evidence.review.approved',
        payload: {
          eventId: generateEventId(),
          occurredAt: new Date().toISOString(),
          reviewId: updated.reviewId,
          evidenceId: updated.evidenceId,
          reviewerId: updated.reviewerId!,
          reviewerRole: updated.reviewerRole,
          userId: updated.userId,
          lessonId: updated.lessonId,
        },
      });

      // Audit log
      deps.auditLogger.logCommandReceived('evidence.review.approve', actorUserId, reviewId);

      return reply.code(200).send({
        review: {
          reviewId: updated.reviewId,
          evidenceId: updated.evidenceId,
          status: updated.status,
        },
      });
    } catch (error: any) {
      deps.logger.error('Approve review failed', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: error.message || 'Internal server error',
        },
      });
    }
  });

  // Reject review
  app.post('/api/evidence/reviews/:reviewId/reject', async (request: FastifyRequest, reply: FastifyReply) => {
    const reviewId = (request.params as any).reviewId as string;
    const body = request.body as any;
    const actorUserId = (request as any).requestContext?.userId as UserId | undefined;

    if (!actorUserId) {
      return reply.code(401).send({
        error: {
          code: 'UNAUTHORIZED',
          category: 'ClientError',
          message: 'Authentication required',
        },
      });
    }

    try {
      const registry = getEvidenceReviewRegistry();
      const review = registry.getReview(reviewId);

      if (!review) {
        return reply.code(404).send({
          error: {
            code: 'NOT_FOUND',
            category: 'ClientError',
            message: `Review ${reviewId} not found`,
          },
        });
      }

      if (review.status !== 'pending') {
        return reply.code(400).send({
          error: {
            code: 'INVALID_STATE',
            category: 'ClientError',
            message: `Review is not pending (current status: ${review.status})`,
          },
        });
      }

      // Check ownership (must be claimed by this reviewer)
      if (review.reviewerId && review.reviewerId !== actorUserId) {
        return reply.code(403).send({
          error: {
            code: 'FORBIDDEN',
            category: 'ClientError',
            message: 'Review is claimed by another reviewer',
          },
        });
      }

      // Reject review
      const updated = registry.updateReviewStatus(reviewId, 'rejected', actorUserId, body.comment);

      if (!updated) {
        return reply.code(500).send({
          error: {
            code: 'INTERNAL_ERROR',
            category: 'TransientFailure',
            message: 'Failed to reject review',
          },
        });
      }

      // Emit event
      await deps.eventBus.emit({
        eventName: 'evidence.review.rejected',
        payload: {
          eventId: generateEventId(),
          occurredAt: new Date().toISOString(),
          reviewId: updated.reviewId,
          evidenceId: updated.evidenceId,
          reviewerId: updated.reviewerId!,
          reviewerRole: updated.reviewerRole,
          userId: updated.userId,
          lessonId: updated.lessonId,
          comment: updated.comment,
        },
      });

      // Audit log
      deps.auditLogger.logCommandReceived('evidence.review.reject', actorUserId, reviewId);

      return reply.code(200).send({
        review: {
          reviewId: updated.reviewId,
          evidenceId: updated.evidenceId,
          status: updated.status,
        },
      });
    } catch (error: any) {
      deps.logger.error('Reject review failed', error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: error.message || 'Internal server error',
        },
      });
    }
  });
}
