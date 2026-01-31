/**
 * HTTP route: GET /api/read/lesson/:lessonId/progress?userId=
 * 
 * Returns LessonProgressSnapshot read model.
 * Read-only query, no side effects.
 */

import type { FastifyInstance } from 'fastify';
import type { Logger } from '@dmf/infra';
import type { LessonId, UserId } from '@dmf/shared';
import { getLessonProgress } from '@dmf/read-models/projections';
import { createEmptySnapshot } from '@dmf/read-models';

export function registerLessonProgressRoute(
  app: FastifyInstance,
  deps: {
    logger: Logger;
  }
) {
  app.get('/api/read/lesson/:lessonId/progress', async (request, reply) => {
    try {
      const lessonId = (request.params as any).lessonId as LessonId;
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

      // Get lesson progress from read model store
      let snapshot = getLessonProgress(userId, lessonId);
      
      // If not found, return empty snapshot (dev-friendly, no 404)
      if (!snapshot) {
        snapshot = createEmptySnapshot(lessonId);
      }

      return reply.code(200).send(snapshot);
    } catch (error: any) {
      deps.logger.error('Lesson progress query failed', error);
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
