/**
 * HTTP route: GET /api/read/assessments/:assessmentId (Tuyến HTTP: Đọc Assessment)
 * 
 * Read-only endpoint for internal consumers (e.g., motivation-progress-service).
 * No PII, minimal data.
 */

import type { FastifyInstance } from 'fastify';
import { AssessmentRepository } from '../../state/assessment.repository';
import type { Database, Logger } from '@dmf/infra';
import { makeNotFound, getHttpStatusCode, StandardError } from '@dmf/shared';

export function registerAssessmentReadRoute(
  app: FastifyInstance,
  deps: {
    database: Database;
    logger: Logger;
  }
) {
  app.get('/api/read/assessments/:assessmentId', async (request, reply) => {
    const assessmentId = (request.params as any).assessmentId;
    const userId = (request as any).user?.userId || '';

    try {
      const assessmentRepository = new AssessmentRepository(deps.database);
      const assessment = await assessmentRepository.findById(assessmentId as any);

      if (!assessment) {
        const notFoundError = makeNotFound('Assessment', assessmentId);
        return reply.code(404).send({ error: notFoundError });
      }

      // Ownership check for read access (Kiểm tra sở hữu cho quyền đọc)
      // For internal consumers, allow if userId matches or if no userId provided (for service-to-service)
      // (Đối với người tiêu dùng nội bộ, cho phép nếu userId khớp hoặc không có userId - cho dịch vụ đến dịch vụ)
      if (userId && assessment.userId !== userId) {
        // Hide existence: return NotFound (per STEP 8B) (Ẩn sự tồn tại: trả về NotFound)
        const notFoundError = makeNotFound('Assessment');
        return reply.code(404).send({ error: notFoundError });
      }

      // Return minimal data (no PII, no raw answers if privacy policy requires) (Trả về dữ liệu tối thiểu)
      return reply.code(200).send({
        id: assessment.id,
        userId: assessment.userId,
        quizId: assessment.quizId,
        status: assessment.status,
        score: assessment.score, // Score is OK for read model (Điểm số OK cho read model)
        startedAt: assessment.startedAt,
        submittedAt: assessment.submittedAt,
        // Exclude answers for privacy (per policy) (Loại trừ đáp án để bảo vệ quyền riêng tư)
      });
    } catch (error: any) {
      deps.logger.error('Assessment read failed', error);

      const standardError: StandardError | undefined = error.standardError;
      if (standardError) {
        const statusCode = getHttpStatusCode(standardError);
        return reply.code(statusCode).send({ error: standardError });
      }

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
