/**
 * Event consumer: system.profile.updated (Người tiêu dùng Sự kiện: Đã cập nhật hồ sơ)
 * 
 * Invalidates ReadinessState cache (recompute on next read).
 */

import type { Event } from '@dmf/infra';
import type { Database, Logger } from '@dmf/infra';
import { ReadinessCacheRepository } from '../../state/readiness-cache.repository';

export async function handleSystemProfileUpdated(
  event: Event,
  deps: {
    database: Database;
    logger: Logger;
  }
): Promise<void> {
  const eventId = event.payload.eventId as string;
  const userId = event.payload.userId as string;

  // Idempotency check (Kiểm tra idempotency)
  const processed = await deps.database.query<{ eventId: string }>(
    'SELECT * FROM processed_events WHERE eventId = ?',
    [eventId]
  );
  if (processed.length > 0) {
    return;
  }
  await deps.database.query('INSERT INTO processed_events VALUES ?', [{ eventId }]);

  // Invalidate cache (Vô hiệu hóa cache)
  const cacheRepository = new ReadinessCacheRepository(deps.database);
  await cacheRepository.invalidate(userId as any);

  deps.logger.info('Readiness cache invalidated for profile update', { userId, eventId });
}
