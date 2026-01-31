/**
 * SLA Heatmap Route
 * 
 * GET /api/ops/reviews/heatmap?bucket=hour&from=...&to=...
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { Logger } from '@dmf/infra';
import { getEvidenceReviewRegistry } from '@dmf/evidence';

type ReviewItem = {
  submittedAt: string;
  expiresAt?: string;
};

export function registerHeatmapRoute(
  app: FastifyInstance,
  deps: { logger: Logger }
) {
  app.get('/api/ops/reviews/heatmap', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as any;
    const bucket = (query.bucket as string) || 'hour'; // hour, day
    const from = query.from as string;
    const to = query.to as string;

    if (!from || !to) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          category: 'ClientError',
          message: 'from and to query parameters are required',
        },
      });
    }

    try {
      const registry = getEvidenceReviewRegistry();
      const fromDate = new Date(from);
      const toDate = new Date(to);

      // Get all reviews in time range
      const allPending = registry.getReviewQueue({ status: 'pending' }) as ReviewItem[];
      const allApproved = registry.getReviewQueue({ status: 'approved' }) as ReviewItem[];
      const allRejected = registry.getReviewQueue({ status: 'rejected' }) as ReviewItem[];
      const allExpired = registry.getReviewQueue({ status: 'expired' }) as ReviewItem[];

      // Filter by time range
      const pendingInRange = allPending.filter((r) => {
        const createdAt = new Date(r.submittedAt);
        return createdAt >= fromDate && createdAt <= toDate;
      });

      const approvedInRange = allApproved.filter((r) => {
        const reviewedAt = r.submittedAt; // Use submittedAt as proxy
        return reviewedAt >= from && reviewedAt <= to;
      });

      const rejectedInRange = allRejected.filter((r) => {
        const reviewedAt = r.submittedAt;
        return reviewedAt >= from && reviewedAt <= to;
      });

      const expiredInRange = allExpired.filter((r) => {
        if (!r.expiresAt) return false;
        return r.expiresAt >= from && r.expiresAt <= to;
      });

      // Create buckets
      const buckets = createBuckets(fromDate, toDate, bucket);

      // Fill buckets with data
      const bucketsWithData = buckets.map((bucket) => {
        const bucketPending = pendingInRange.filter((r) => {
          const createdAt = new Date(r.submittedAt);
          return createdAt >= bucket.start && createdAt < bucket.end;
        });

        const bucketApproved = approvedInRange.filter((r) => {
          const reviewedAt = new Date(r.submittedAt);
          return reviewedAt >= bucket.start && reviewedAt < bucket.end;
        });

        const bucketRejected = rejectedInRange.filter((r) => {
          const reviewedAt = new Date(r.submittedAt);
          return reviewedAt >= bucket.start && reviewedAt < bucket.end;
        });

        const bucketExpired = expiredInRange.filter((r) => {
          if (!r.expiresAt) return false;
          const expiredAt = new Date(r.expiresAt);
          return expiredAt >= bucket.start && expiredAt < bucket.end;
        });

        // Calculate average age
        const now = new Date();
        const ages = bucketPending.map((r) => {
          const createdAt = new Date(r.submittedAt);
          return (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60); // hours
        });
        const avgAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;

        return {
          bucketStart: bucket.start.toISOString(),
          pending: bucketPending.length,
          approved: bucketApproved.length,
          rejected: bucketRejected.length,
          expired: bucketExpired.length,
          slaBreaches: bucketExpired.length,
          avgAgeHours: avgAge,
        };
      });

      return reply.code(200).send({
        buckets: bucketsWithData,
        bucketSize: bucket,
      });
    } catch (error: any) {
      deps.logger.error('Get heatmap failed', error);
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

/**
 * Create time buckets
 */
function createBuckets(from: Date, to: Date, bucketSize: string): Array<{ start: Date; end: Date }> {
  const buckets: Array<{ start: Date; end: Date }> = [];
  const current = new Date(from);

  const incrementMs =
    bucketSize === 'hour' ? 60 * 60 * 1000 : bucketSize === 'day' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;

  while (current < to) {
    const start = new Date(current);
    const end = new Date(current.getTime() + incrementMs);
    buckets.push({ start, end });
    current.setTime(end.getTime());
  }

  return buckets;
}
