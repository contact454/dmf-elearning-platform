/**
 * HTTP route: GET /api/learner/dashboard (Tuyến HTTP: Bảng điều khiển học viên)
 * 
 * Returns learner dashboard view (read model) derived from ProgressState, MasteryState, and ReadinessState.
 * Aggregates data from multiple services via read-only HTTP calls.
 * Uses in-memory ProgressState repository (M3).
 */

import type { FastifyInstance } from 'fastify';
import type { ProgressStateRepository } from '../../state/in-memory-progress.repository.js';
import type { Logger, HttpClient } from '@dmf/infra';
import { makeNotFound, getHttpStatusCode, type StandardError, type UserId } from '@dmf/shared';

// Response DTOs for external service calls (DTO phản hồi cho các lời gọi dịch vụ bên ngoài)
interface MasteryStateDto {
  overallScore?: number;
  skillBreakdown?: {
    grammar?: number;
    vocabulary?: number;
    speaking?: number;
    listening?: number;
    reading?: number;
    writing?: number;
  };
}

interface ReadinessStateDto {
  readiness?: {
    overall?: 'ready' | 'not_ready' | 'almost_ready' | 'unknown';
  };
}

export function registerProgressDashboardRoute(
  app: FastifyInstance,
  deps: {
    progressRepo: ProgressStateRepository;
    logger: Logger;
    httpClient: HttpClient;
  }
) {
  app.get('/api/learner/dashboard', async (request, reply) => {
    const userId = (request.query as { userId?: string }).userId ?? ''; // TODO: Extract from auth token
    const authenticatedUserId = (request as { user?: { userId?: string } }).user?.userId ?? userId;

    try {
      // Ownership check (Kiểm tra sở hữu)
      if (authenticatedUserId && userId !== authenticatedUserId) {
        const notFoundError = makeNotFound('Dashboard');
        return reply.code(404).send({ error: notFoundError });
      }

      const progressState = await deps.progressRepo.getOrCreate(userId as UserId);

      // 1. Fetch MasteryState from motivation-progress-service (read-only) (Lấy MasteryState từ motivation-progress-service - chỉ đọc)
      let masteryState: MasteryStateDto | null = null;
      let skillScores: Record<string, number> = {};
      try {
        const masteryResponse = await deps.httpClient.get<MasteryStateDto>(`http://localhost:3005/api/read/mastery/${userId}`);
        if (masteryResponse.status === 200) {
          masteryState = masteryResponse.data;
          const sb = masteryState?.skillBreakdown;
          if (sb) {
            skillScores = {
              grammar: ((sb.grammar ?? 0) / 100),
              vocabulary: ((sb.vocabulary ?? 0) / 100),
              speaking: ((sb.speaking ?? 0) / 100),
              listening: ((sb.listening ?? 0) / 100),
              reading: ((sb.reading ?? 0) / 100),
              writing: ((sb.writing ?? 0) / 100),
            };
          }
        }
      } catch (error) {
        // Logger.warn signature: warn(message: string, context?: LogContext)
        deps.logger.warn('Failed to fetch mastery state from motivation-progress-service', {
          userId: String(userId),
          error: error instanceof Error ? error.message : String(error),
        });
      }

      // 2. Fetch ReadinessState from assessment-service (read-only) (Lấy ReadinessState từ assessment-service - chỉ đọc)
      let readinessStatus: 'ready' | 'not_ready' | 'almost_ready' | 'unknown' = 'unknown';
      try {
        const readinessResponse = await deps.httpClient.get<ReadinessStateDto>(`http://localhost:3006/api/learner/readiness/${userId}`);
        if (readinessResponse.status === 200) {
          const readinessState = readinessResponse.data;
          readinessStatus = readinessState.readiness?.overall || 'unknown';
        }
      } catch (error) {
        // Logger.warn signature: warn(message: string, context?: LogContext)
        deps.logger.warn('Failed to fetch readiness state from assessment-service', {
          userId: String(userId),
          error: error instanceof Error ? error.message : String(error),
        });
      }

      // 3. Build dashboard view (read model) (Xây dựng khung nhìn bảng điều khiển - mô hình đọc)
      const dashboard = {
        userId: progressState.userId,
        currentCourseId: progressState.currentCourseId,
        progressSummary: {
          completedLessons: progressState.completedLessons.length,
          completedUnits: progressState.unlockedUnits.length,
          totalLessons: 0, // TODO: Fetch from curriculum-service
          totalUnits: 0, // TODO: Fetch from curriculum-service
        },
        masterySummary: {
          overallScore: (masteryState?.overallScore ?? 0) / 100,
          skillScores,
        },
        readinessStatus: readinessStatus as 'ready' | 'not_ready' | 'unknown', // Narrow type for response (Thu hẹp kiểu cho phản hồi)
        lastUpdatedAt: progressState.updatedAt.toISOString(),
      };

      return reply.code(200).send({ dashboard });
    } catch (error: any) {
      deps.logger.error('Dashboard query failed', error);

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
