/**
 * HTTP route: GET /api/read/dashboard/:userId
 * 
 * Returns UserLearningDashboard read model.
 * Read-only query, no side effects.
 */

import type { FastifyInstance } from 'fastify';
import type { Logger } from '@dmf/infra';
import type { UserId } from '@dmf/shared';
import { getDashboard } from '@dmf/read-models/projections';
import { createEmptyDashboard } from '@dmf/read-models';

export function registerDashboardRoute(
  app: FastifyInstance,
  deps: {
    logger: Logger;
  }
) {
  app.get('/api/read/dashboard/:userId', async (request, reply) => {
    try {
      const userId = (request.params as any).userId as UserId;

      // Get dashboard from read model store
      let dashboard = getDashboard(userId);
      
      // If not found, return empty dashboard (dev-friendly, no 404)
      if (!dashboard) {
        dashboard = createEmptyDashboard(userId);
      }

      return reply.code(200).send(dashboard);
    } catch (error: any) {
      deps.logger.error('Dashboard query failed', error);
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
