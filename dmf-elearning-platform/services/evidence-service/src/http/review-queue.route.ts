/**
 * Review Queue Route
 * 
 * GET /api/evidence/reviews?status=pending&reviewerRole=teacher
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { Logger } from '@dmf/infra';
import { getEvidenceReviewRegistry } from '@dmf/evidence';
import type { EvidenceReviewStatus, ReviewerRole } from '@dmf/evidence';

export function registerReviewQueueRoute(
  app: FastifyInstance,
  deps: { logger: Logger }
) {
  app.get('/api/evidence/reviews', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as any;
    const status = query.status as EvidenceReviewStatus | undefined;
    const reviewerRole = query.reviewerRole as ReviewerRole | undefined;
    const courseId = query.courseId as string | undefined;
    const lessonId = query.lessonId as string | undefined;

    try {
      const registry = getEvidenceReviewRegistry();
      const queue = registry.getReviewQueue({
        status: status || 'pending',
        reviewerRole,
        courseId,
        lessonId,
      });

      return reply.code(200).send({
        reviews: queue,
        count: queue.length,
      });
    } catch (error: any) {
      deps.logger.error('Get review queue failed', error);
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
