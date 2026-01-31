/**
 * HTTP route: GET /api/curriculum/courses (Tuyến HTTP: Danh sách khóa học)
 * 
 * Returns list of available courses (for dev/E2E testing).
 * In production, this would query a Course repository or external service.
 */

import type { FastifyInstance } from 'fastify';
import type { Logger } from '@dmf/infra';
import type { CourseId } from '@dmf/shared';

export function registerCurriculumCoursesRoute(
  app: FastifyInstance,
  deps: {
    logger: Logger;
  }
) {
  app.get('/api/curriculum/courses', async (_request, reply) => {
    try {
      // For dev/E2E: return a default courseId
      // In production, this would query a Course repository
      const defaultCourseId: CourseId = 'course-1' as CourseId;
      
      return reply.code(200).send({
        courses: [
          {
            id: defaultCourseId,
            name: 'Default Course',
            description: 'Default course for E2E testing',
          },
        ],
      });
    } catch (error: any) {
      deps.logger.error('Failed to list courses', error);
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
