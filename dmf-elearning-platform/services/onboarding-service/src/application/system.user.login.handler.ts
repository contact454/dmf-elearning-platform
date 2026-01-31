/**
 * Command handler: system.user.login (Bộ xử lý lệnh: Đăng nhập)
 */

import type { SystemUserLoginCommand } from '@dmf/contracts';
import type { UserRepository } from '../state/user.repository';
import type { EventBus, Outbox } from '@dmf/infra';
import { makeNotFound } from '@dmf/shared';
import { emitViaOutbox } from '@dmf/infra/adapters';
import bcrypt from 'bcrypt';

export async function handleSystemUserLogin(
  command: SystemUserLoginCommand,
  _context: {},
  deps: {
    userRepository: UserRepository;
    eventBus: EventBus;
    outbox: Outbox;
  }
) {
  // 1. Find user by email (Tìm người dùng theo email)
  const user = await deps.userRepository.findByEmail(command.email);
  if (!user) {
    // Hide existence: return NotFound (per STEP 8B) (Ẩn sự tồn tại: trả về NotFound)
    const notFoundError = makeNotFound('User');
    const error = new Error(notFoundError.message);
    (error as any).standardError = notFoundError;
    throw error;
  }

  // 2. Verify password using bcrypt (Xác minh mật khẩu bằng bcrypt)
  const isPasswordValid = await bcrypt.compare(command.password, user.passwordHash);
  if (!isPasswordValid) {
    // Hide existence: return NotFound (per STEP 8B) (Ẩn sự tồn tại: trả về NotFound)
    const notFoundError = makeNotFound('User');
    const error = new Error(notFoundError.message);
    (error as any).standardError = notFoundError;
    throw error;
  }

  // 3. Emit event via outbox (write-then-emit safety) (Phát sự kiện qua outbox - an toàn ghi rồi mới phát)
  const eventId = generateEventId();
  const commandKey = command.correlationId || `login:${user.id}`;
  await emitViaOutbox(
    {
      eventName: 'system.user.login',
      payload: {
        eventId,
        occurredAt: new Date().toISOString(),
        correlationId: command.correlationId,
        userId: user.id,
      },
    },
    deps.eventBus,
    deps.outbox,
    commandKey
  );

  return { userId: user.id, token: `token_${user.id}` }; // Simple token for MVP
}

function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
