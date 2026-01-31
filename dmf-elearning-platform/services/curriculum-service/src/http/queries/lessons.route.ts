/**
 * HTTP route: GET /api/curriculum/courses/:courseId/lessons (Tuyến HTTP: Danh sách bài học)
 * 
 * Returns list of lessons for a course (for dev/E2E testing).
 * In production, this would query a Lesson repository or external service.
 */

import type { FastifyInstance } from 'fastify';
import type { Logger } from '@dmf/infra';
import type { LessonId } from '@dmf/shared';

export function registerCurriculumLessonsRoute(
  app: FastifyInstance,
  deps: {
    logger: Logger;
  }
) {
  app.get('/api/curriculum/courses/:courseId/lessons', async (request, reply) => {
    try {
      const courseId = (request.params as any).courseId;
      
      // For dev/E2E: return a default lessonId for any course
      // In production, this would query a Lesson repository
      const defaultLessonId: LessonId = 'lesson-1' as LessonId;
      
      return reply.code(200).send({
        lessons: [
          {
            id: defaultLessonId,
            courseId,
            name: 'Default Lesson',
            description: 'Default lesson for E2E testing',
          },
        ],
      });
    } catch (error: any) {
      deps.logger.error('Failed to list lessons', error);
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
