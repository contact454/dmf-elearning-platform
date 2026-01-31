/**
 * GET /api/learner/courses/:courseId/progress
 * Returns progress for the given user and course (learner-scoped).
 */

import type { FastifyInstance } from 'fastify';
import type { ProgressStateRepository } from '../../state/in-memory-progress.repository.js';
import type { Logger } from '@dmf/infra';
import { makeNotFound, getHttpStatusCode, type StandardError } from '@dmf/shared';

export function registerCourseProgressRoute(
  app: FastifyInstance,
  deps: { progressRepo: ProgressStateRepository; logger: Logger }
): void {
  app.get<{
    Params: { courseId: string };
    Querystring: { userId?: string };
  }>('/api/learner/courses/:courseId/progress', async (request, reply) => {
    const courseId = request.params.courseId;
    const userId = (request.query as { userId?: string }).userId ?? (request as unknown as { user?: { userId?: string } }).user?.userId ?? '';

    if (!userId) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          category: 'ClientError',
          message: 'userId required (query or auth)',
        },
      });
    }

    try {
      const state = await deps.progressRepo.findByUserId(userId as import('@dmf/shared').UserId);
      if (!state) {
        const notFound = makeNotFound('Progress', userId);
        return reply.code(404).send({ error: notFound });
      }

      if (state.currentCourseId && state.currentCourseId !== courseId) {
        deps.logger.info('Course progress requested for non-current course', {
          userId,
          courseId,
          currentCourseId: state.currentCourseId,
        });
      }

      const progress = {
        userId: state.userId,
        courseId,
        completedLessonIds: state.completedLessons,
        unlockedLessonIds: state.unlockedLessons,
        unlockedUnitIds: state.unlockedUnits,
        lastUpdatedAt: state.updatedAt.toISOString(),
      };

      return reply.code(200).send({ progress });
    } catch (err) {
      deps.logger.error('Course progress query failed', err as Error, { userId, courseId });
      const se = (err as { standardError?: StandardError }).standardError;
      if (se) return reply.code(getHttpStatusCode(se)).send({ error: se });
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          category: 'TransientFailure',
          message: (err as Error).message || 'Internal server error',
        },
      });
    }
  });
}
