/**
 * Event consumer: mentoring.feedback.published (Người tiêu dùng Sự kiện: Đã xuất bản phản hồi)
 * 
 * Invalidates ReadinessState cache (recompute on next read).
 */

import type { Event } from '@dmf/infra';
import type { Database, Logger, HttpClient } from '@dmf/infra';
import { ReadinessCacheRepository } from '../../state/readiness-cache.repository';

export async function handleMentoringFeedbackPublished(
  event: Event,
  deps: {
    database: Database;
    logger: Logger;
    httpClient: HttpClient;
  }
): Promise<void> {
  const eventId = event.payload.eventId as string;
  const submissionId = event.payload.submissionId as string;

  // Idempotency check (Kiểm tra idempotency)
  const processed = await deps.database.query<{ eventId: string }>(
    'SELECT * FROM processed_events WHERE eventId = ?',
    [eventId]
  );
  if (processed.length > 0) {
    return;
  }
  await deps.database.query('INSERT INTO processed_events VALUES ?', [{ eventId }]);

  // Get userId from submission (Lấy userId từ submission)
  let userId: string | null = null;
  try {
    const submissionResponse = await deps.httpClient.get(`http://localhost:3001/api/internal/submissions/${submissionId}`);
    if (submissionResponse.status === 200) {
      userId = (submissionResponse.data as any).userId;
    }
  } catch (error) {
    deps.logger.warn(`Failed to fetch submission for userId submissionId=${submissionId}`, { error: error instanceof Error ? error.message : String(error) });
  }

  if (!userId) {
    return;
  }

  // Invalidate cache (Vô hiệu hóa cache)
  const cacheRepository = new ReadinessCacheRepository(deps.database);
  await cacheRepository.invalidate(userId as any);

  deps.logger.info('Readiness cache invalidated for feedback', { userId, eventId });
}
