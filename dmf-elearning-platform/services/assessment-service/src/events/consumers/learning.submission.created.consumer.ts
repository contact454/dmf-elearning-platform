/**
 * Event consumer: learning.submission.created (Người tiêu dùng Sự kiện: Đã tạo nộp bài)
 * 
 * Invalidates ReadinessState cache (recompute on next read).
 */

import type { Event } from '@dmf/infra';
import type { Database, Logger, HttpClient } from '@dmf/infra';
import { ReadinessCacheRepository } from '../../state/readiness-cache.repository';

export async function handleLearningSubmissionCreated(
  event: Event,
  deps: {
    database: Database;
    logger: Logger;
    httpClient: HttpClient;
  }
): Promise<void> {
  const eventId = event.payload.eventId as string;
  const attemptId = event.payload.attemptId as string;

  // Idempotency check (Kiểm tra idempotency)
  const processed = await deps.database.query<{ eventId: string }>(
    'SELECT * FROM processed_events WHERE eventId = ?',
    [eventId]
  );
  if (processed.length > 0) {
    return;
  }
  await deps.database.query('INSERT INTO processed_events VALUES ?', [{ eventId }]);

  // Get userId from attempt (Lấy userId từ attempt)
  let userId: string | null = null;
  try {
    const attemptResponse = await deps.httpClient.get(`http://localhost:3001/api/internal/attempts/${attemptId}`);
    if (attemptResponse.status === 200) {
      userId = (attemptResponse.data as any).userId;
    }
  } catch (error) {
    deps.logger.warn(`Failed to fetch attempt for userId attemptId=${attemptId}`, { error: error instanceof Error ? error.message : String(error) });
  }

  if (!userId) {
    return;
  }

  // Invalidate cache (Vô hiệu hóa cache)
  const cacheRepository = new ReadinessCacheRepository(deps.database);
  await cacheRepository.invalidate(userId as any);

  deps.logger.info('Readiness cache invalidated for submission', { userId, eventId });
}
