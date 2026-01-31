/**
 * Evidence Summary Route
 * 
 * GET /api/evidence/summary?userId=&lessonId=
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { Logger } from '@dmf/infra';
import { getEvidenceRegistry } from '@dmf/evidence';

export function registerEvidenceSummaryRoute(
  app: FastifyInstance,
  deps: { logger: Logger }
) {
  app.get('/api/evidence/summary', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request.query as any).userId as string;
    const lessonId = (request.query as any).lessonId as string | undefined;

    if (!userId) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          category: 'ClientError',
          message: 'userId query parameter is required',
        },
      });
    }

    try {
      const registry = getEvidenceRegistry();
      const summary = registry.getEvidenceSummary(userId, lessonId);

      return reply.code(200).send({ summary });
    } catch (error: any) {
      deps.logger.error('Get evidence summary failed', error);
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
