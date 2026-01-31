/**
 * HTTP route: GET /api/learner/readiness/:userId (Tuyến HTTP: Sẵn sàng của người học)
 * 
 * Computes ReadinessState using education/readiness-model pure function.
 * May use cache, but cache is NOT source of truth.
 */

import type { FastifyInstance } from 'fastify';
import { computeReadiness } from '@dmf/education-readiness-model';
import { ReadinessCacheRepository } from '../../state/readiness-cache.repository';
import { AssessmentRepository } from '../../state/assessment.repository';
import type { Database, Logger, HttpClient } from '@dmf/infra';
import { makeNotFound, getHttpStatusCode, StandardError } from '@dmf/shared';

export function registerReadinessRoute(
  app: FastifyInstance,
  deps: {
    database: Database;
    logger: Logger;
    httpClient: HttpClient;
  }
) {
  app.get('/api/learner/readiness/:userId', async (request, reply) => {
    const userId = (request.params as any).userId;
    const authenticatedUserId = (request as any).user?.userId || '';

    try {
      // Ownership check (Kiểm tra sở hữu)
      if (authenticatedUserId && userId !== authenticatedUserId) {
        // Hide existence: return NotFound (per STEP 8B) (Ẩn sự tồn tại: trả về NotFound)
        const notFoundError = makeNotFound('Readiness');
        return reply.code(404).send({ error: notFoundError });
      }

      const cacheRepository = new ReadinessCacheRepository(deps.database);
      const assessmentRepository = new AssessmentRepository(deps.database);

      // Try cache first (Thử cache trước)
      const cached = await cacheRepository.get(userId);
      if (cached) {
        deps.logger.info('Readiness cache hit', { userId });
        return reply.code(200).send(cached);
      }

      // Cache miss: compute readiness (Cache miss: tính toán sẵn sàng)
      deps.logger.info('Readiness cache miss, computing', { userId });

      // 1. Read MasteryState from motivation-progress-service (read-only) (Đọc MasteryState từ motivation-progress-service - chỉ đọc)
      let masteryState: any = null;
      try {
        const masteryResponse = await deps.httpClient.get(`http://localhost:3005/api/read/mastery/${userId}`);
        if (masteryResponse.status === 200) {
          masteryState = masteryResponse.data;
        }
      } catch (error) {
        deps.logger.warn(`Failed to fetch mastery state from motivation-progress-service userId=${userId}`, { error: error instanceof Error ? error.message : String(error) });
      }

      // 2. Read latest Assessment from own service (optional) (Đọc Assessment mới nhất từ dịch vụ của chính mình - tùy chọn)
      let latestAssessment: any = null;
      try {
        // Get all assessments for user (Lấy tất cả assessments cho người dùng)
        const allAssessments = await assessmentRepository.findByUserId(userId);
        // Get latest graded assessment (Lấy assessment đã chấm điểm mới nhất)
        latestAssessment = allAssessments
          .filter((a) => a.status === 'graded' && a.score !== undefined)
          .sort((a, b) => (b.submittedAt?.getTime() || 0) - (a.submittedAt?.getTime() || 0))[0] || null;
      } catch (error) {
        deps.logger.warn(`Failed to fetch assessment userId=${userId}`, { error: error instanceof Error ? error.message : String(error) });
      }

      // 3. Compute ReadinessState using pure function (Tính toán ReadinessState bằng hàm thuần)
      const readinessState = computeReadiness(userId, masteryState, latestAssessment);

      // 4. Cache result (optional) (Lưu kết quả vào cache - tùy chọn)
      await cacheRepository.set(readinessState);

      return reply.code(200).send(readinessState);
    } catch (error: any) {
      deps.logger.error('Readiness query failed', error);

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
