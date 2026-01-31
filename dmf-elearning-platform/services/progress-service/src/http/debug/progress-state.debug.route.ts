/**
 * Debug endpoint: GET /__debug/progress-state/:userId
 * Returns diagnostic ProgressState (in-memory store). TEMP for E2E.
 */

import type { FastifyInstance } from 'fastify';
import type { ProgressStateRepository } from '../../state/in-memory-progress.repository.js';

export function registerProgressStateDebugRoute(
  app: FastifyInstance,
  progressRepo: ProgressStateRepository
): void {
  app.get<{ Params: { userId: string } }>('/__debug/progress-state/:userId', async (request) => {
    const userId = request.params.userId;
    const progressState = await progressRepo.findByUserId(userId as import('@dmf/shared').UserId);
    const allStates = progressRepo.listAll();

    return {
      pid: process.pid,
      userId,
      found: !!progressState,
      progressState: progressState
        ? {
            userId: progressState.userId,
            completedLessons: progressState.completedLessons,
            unlockedLessons: progressState.unlockedLessons,
            unlockedUnits: progressState.unlockedUnits,
            createdAt: progressState.createdAt,
            updatedAt: progressState.updatedAt,
          }
        : null,
      allStatesCount: allStates.length,
      allUserIds: allStates.map((s) => s.userId).slice(0, 10),
      moduleUrl: import.meta.url,
    };
  });
}
