/**
 * Command Handler: system.user.login (Bộ xử lý Lệnh: đăng nhập)
 */

import type { SystemUserLoginCommand } from '@dmf/contracts';
import type { EventBus, AuditLogger } from '@dmf/infra';

export async function handleSystemUserLogin(
  command: SystemUserLoginCommand,
  context: { logger: AuditLogger; eventEmitter: EventBus }
): Promise<{ sessionId: string; userId: string }> {
  const requestId = crypto.randomUUID();
  context.logger.logCommandReceived('system.user.login', 'anonymous', requestId, command.correlationId);

  // TODO: Validate credentials, create Session
  const sessionId = crypto.randomUUID();
  const userId = 'user-123'; // TODO: Get from validated user

  await context.eventEmitter.emit({
    eventName: 'system.user.login',
    payload: {
      eventId: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
      correlationId: command.correlationId,
      userId,
      // deviceId/sessionId NOT in payload - must be read from Session entity per STEP 5C
    },
  });

  return { sessionId, userId };
}
