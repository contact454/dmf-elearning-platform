/**
 * Diagnostic endpoint: GET /api/debug/attempts (dev only)
 * 
 * Returns list of all attempts in the store for debugging.
 * Only available when NODE_ENV !== 'production'.
 */

import type { FastifyInstance } from 'fastify';
import { getAttemptStore, getAttemptStoreInstanceId } from '../../state';

export function registerAttemptsListDebugRoute(app: FastifyInstance) {
  app.get('/api/debug/attempts', async () => {
    // Guard: only in dev/E2E
    if (process.env.NODE_ENV === 'production') {
      return { error: 'Not available in production' };
    }

    const store = getAttemptStore();
    const storeInstanceId = getAttemptStoreInstanceId();
    const attempts = Array.from(store.values());

    return {
      processId: process.pid,
      storeInstanceId,
      count: attempts.length,
      attempts: attempts.map((a) => ({
        id: a.id,
        userId: a.userId,
        lessonId: a.lessonId,
        status: a.status,
        startedAt: a.startedAt,
      })),
    };
  });
}
