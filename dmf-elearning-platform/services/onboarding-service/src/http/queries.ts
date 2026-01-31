/**
 * Query Endpoints (Điểm cuối Truy vấn)
 * All learner + teacher/mentor query endpoints per STEP 6
 */

import type { FastifyInstance } from 'fastify';
import type { AuditLogger } from '@dmf/infra';
import { forbidRole } from '@dmf/shared';

interface ServiceContext {
  logger: AuditLogger;
}

export function setupQueryRoutes(server: FastifyInstance, context: ServiceContext): void {
  // Learner endpoints (8 endpoints)
  server.get('/api/learner/dashboard', async (request, reply) => {
    try {
      const authUser = (request as any).user as { userId?: string; role?: string } | undefined;
      forbidRole(authUser?.role as any, ['learner']);
      context.logger.logQueryAccess('/api/learner/dashboard', authUser?.userId || '', authUser?.role);
      // TODO: Return LearnerDashboardView
      return reply.code(200).send({ dashboard: {} });
    } catch (error: unknown) {
      const statusCode = (error as any)?.statusCode || 500;
      const message = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(statusCode).send({ error: message });
    }
  });

  server.get('/api/learner/courses/:courseId/progress', async (request, reply) => {
    try {
      const authUser = (request as any).user as { userId?: string; role?: string } | undefined;
      forbidRole(authUser?.role as any, ['learner']);
      context.logger.logQueryAccess('/api/learner/courses/:courseId/progress', authUser?.userId || '', authUser?.role);
      // TODO: Return LearnerCourseProgressView
      return reply.code(200).send({ progress: {} });
    } catch (error: unknown) {
      const statusCode = (error as any)?.statusCode || 500;
      const message = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(statusCode).send({ error: message });
    }
  });

  // ... other learner endpoints (stubs for MVP skeleton)

  // Teacher/Mentor endpoints (4 endpoints)
  server.get('/api/teacher/feedback-queue', async (request, reply) => {
    try {
      const authUser = (request as any).user as { userId?: string; role?: string } | undefined;
      forbidRole(authUser?.role as any, ['teacher', 'mentor']);
      context.logger.logQueryAccess('/api/teacher/feedback-queue', authUser?.userId || '', authUser?.role);
      // TODO: Return FeedbackQueueView (filtered by authorId === authenticated.userId)
      return reply.code(200).send({ queue: [] });
    } catch (error: unknown) {
      const statusCode = (error as any)?.statusCode || 500;
      const message = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(statusCode).send({ error: message });
    }
  });

  server.get('/api/teacher/submissions/:submissionId', async (request, reply) => {
    try {
      const authUser = (request as any).user as { userId?: string; role?: string } | undefined;
      forbidRole(authUser?.role as any, ['teacher', 'mentor']);
      const { submissionId } = request.params as { submissionId: string };
      // TODO: Verify FeedbackRequest.submissionId === submissionId AND FeedbackRequest.authorId === authenticated.userId
      context.logger.logQueryAccess('/api/teacher/submissions/:submissionId', authUser?.userId || '', submissionId);
      // TODO: Return SubmissionDetailView
      return reply.code(200).send({ submission: {} });
    } catch (error: unknown) {
      // Ownership failure -> 404 per STEP 8B
      const statusCode = (error as any)?.statusCode || 404;
      const message = error instanceof Error ? error.message : 'Unknown error';
      return reply.code(statusCode).send({ error: message });
    }
  });

  // ... other teacher/mentor endpoints (stubs)
}
