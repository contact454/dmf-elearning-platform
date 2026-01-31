/**
 * Ops Snapshot Route
 * 
 * GET /api/ops/snapshot?from=...&to=...
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { Logger } from '@dmf/infra';
import { buildOpsSnapshot } from '@dmf/ops';

export function registerOpsSnapshotRoute(
  app: FastifyInstance,
  deps: { logger: Logger }
) {
  app.get('/api/ops/snapshot', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as any;
    const from = query.from as string;
    const to = query.to as string;

    // Default: last 24 hours
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 24 * 60 * 60 * 1000);

    try {
      const snapshot = buildOpsSnapshot(fromDate.toISOString(), toDate.toISOString());

      return reply.code(200).send({ snapshot });
    } catch (error: any) {
      deps.logger.error('Get ops snapshot failed', error);
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
