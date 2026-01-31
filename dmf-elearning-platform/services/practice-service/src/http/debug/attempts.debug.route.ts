/**
 * Debug endpoint: GET /__debug/attempts/:attemptId
 * 
 * Returns diagnostic information about an attempt in the store.
 * TEMP endpoint for E2E debugging - remove after Step 4 passes.
 */

import type { FastifyInstance } from 'fastify';
import { getAttemptStore, getAttemptStoreInstanceId, getAttemptStoreSize } from '../../state';

export function registerAttemptsDebugRoute(app: FastifyInstance) {
  app.get('/__debug/attempts/:attemptId', async (request) => {
    const attemptId = (request.params as any).attemptId;
    const store = getAttemptStore();
    const storeInstanceId = getAttemptStoreInstanceId();
    const hasInStore = store.has(attemptId);
    const storeSize = getAttemptStoreSize();
    const attempt = hasInStore ? store.get(attemptId) : null;

    return {
      pid: process.pid,
      id: attemptId,
      attemptId,
      storeInstanceId,
      has: hasInStore,
      hasInStore,
      size: storeSize,
      storeSize,
      allAttemptIds: Array.from(store.keys()).slice(0, 10), // First 10 for debugging
      moduleUrl: import.meta.url,
      attempt: attempt
        ? {
            id: attempt.id,
            userId: attempt.userId,
            lessonId: attempt.lessonId,
            status: attempt.status,
            startedAt: attempt.startedAt,
          }
        : null,
    };
  });
}
