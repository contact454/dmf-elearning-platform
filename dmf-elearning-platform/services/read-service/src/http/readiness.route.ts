/**
 * HTTP route: GET /api/read/assessment/readiness?userId=
 * 
 * Returns AssessmentReadinessView read model.
 * Read-only query, no side effects.
 * 
 * Note: In MVP, this aggregates from multiple services.
 * For now, returns basic structure.
 */

import type { FastifyInstance } from 'fastify';
import type { Logger } from '@dmf/infra';
import type { UserId } from '@dmf/shared';
import { createEmptyReadinessView } from '@dmf/read-models';

export function registerReadinessRoute(
  app: FastifyInstance,
  deps: {
    logger: Logger;
  }
) {
  app.get('/api/read/assessment/readiness', async (request, reply) => {
    try {
      const userId = (request.query as any).userId as UserId;

      if (!userId) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            category: 'ClientError',
            message: 'userId query parameter is required',
          },
        });
      }

      // TODO: Aggregate from motivation-progress-service and assessment-service
      // For MVP, return empty readiness view
      const readinessView = createEmptyReadinessView(userId);

      return reply.code(200).send(readinessView);
    } catch (error: any) {
      deps.logger.error('Readiness query failed', error);
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
