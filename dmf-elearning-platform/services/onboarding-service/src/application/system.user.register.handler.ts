/**
 * Command handler: system.user.register (Bộ xử lý lệnh: Đăng ký người dùng)
 */

import type { SystemUserRegisterCommand } from '@dmf/contracts';
import type { UserRepository } from '../state/user.repository';
import type { EventBus, IdempotencyStore, Outbox } from '@dmf/infra';
import { UserRole } from '@dmf/shared';
import { makeIdempotencyKey, makeNaturalKey } from '@dmf/infra';
import { makeConflict } from '@dmf/shared';
import { emitViaOutbox } from '@dmf/infra/adapters';
import bcrypt from 'bcrypt';

export interface SystemUserRegisterContext {
  // No auth required for registration (Không cần xác thực cho đăng ký)
}

export async function handleSystemUserRegister(
  command: SystemUserRegisterCommand,
  _context: SystemUserRegisterContext,
  deps: {
    userRepository: UserRepository;
    eventBus: EventBus;
    idempotencyStore: IdempotencyStore;
    outbox: Outbox;
  }
) {
  // 1. Idempotency check (Kiểm tra idempotency)
  if (command.correlationId) {
    const idempotencyKey = makeIdempotencyKey('system.user.register', command.correlationId);
    const existingResult = await deps.idempotencyStore.get(idempotencyKey);
    if (existingResult) {
      // Idempotent replay: return same result, do NOT emit event (Phát lại idempotent: trả về kết quả cũ, KHÔNG phát sự kiện)
      return {
        userId: existingResult.resultIds.userId,
        replayed: true,
      };
    }
  }

  // 2. Check if user already exists by email (natural key) (Kiểm tra người dùng đã tồn tại theo email - khóa tự nhiên)
  const existingUser = await deps.userRepository.findByEmail(command.email);
  if (existingUser) {
    // If no correlationId, this is a conflict (Nếu không có correlationId, đây là conflict)
    if (!command.correlationId) {
      const conflictError = makeConflict('User already exists');
      const error = new Error(conflictError.message);
      (error as any).standardError = conflictError;
      throw error;
    }
    // If correlationId exists but user exists, check if it's from same correlationId
    // (Nếu correlationId tồn tại nhưng người dùng đã tồn tại, kiểm tra xem có phải từ cùng correlationId)
    const naturalKey = makeNaturalKey('email', command.email);
    const naturalKeyResult = await deps.idempotencyStore.get(naturalKey);
    if (naturalKeyResult && naturalKeyResult.resultIds.userId === existingUser.id) {
      // Same user from previous registration (Cùng người dùng từ đăng ký trước)
      return { userId: existingUser.id, replayed: true };
    }
    // Different correlationId, conflict (Khác correlationId, conflict)
    const conflictError = makeConflict('User already exists');
    const error = new Error(conflictError.message);
    (error as any).standardError = conflictError;
    throw error;
  }

  // 2. Create User entity (Tạo thực thể User)
  const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as any;
  const user = await deps.userRepository.create({
    id: userId,
    email: command.email,
    passwordHash: await hashPassword(command.password), // Use bcrypt
    role: UserRole.LEARNER,
    firstName: command.firstName,
    lastName: command.lastName,
    targetLanguage: command.targetLanguage,
    createdAt: new Date(),
  });

  // 3. Emit event via outbox (write-then-emit safety) (Phát sự kiện qua outbox - an toàn ghi rồi mới phát)
  const eventId = generateEventId();
  const commandKey = command.correlationId || makeNaturalKey('email', command.email);
  await emitViaOutbox(
    {
      eventName: 'system.user.registered',
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

  // 4. Store idempotency result (Lưu kết quả idempotency)
  if (command.correlationId) {
    const idempotencyKey = makeIdempotencyKey('system.user.register', command.correlationId);
    await deps.idempotencyStore.set(idempotencyKey, {
      resultIds: { userId: user.id },
      emittedEventIds: [eventId],
      timestamp: new Date().toISOString(),
    });
  }

  // Also store natural key (email) (Cũng lưu khóa tự nhiên - email)
  const naturalKey = makeNaturalKey('email', command.email);
  await deps.idempotencyStore.set(naturalKey, {
    resultIds: { userId: user.id },
    emittedEventIds: [eventId],
    timestamp: new Date().toISOString(),
  });

  return { userId: user.id };
}

async function hashPassword(password: string): Promise<string> {
  // Use bcrypt with salt rounds 10 (Sử dụng bcrypt với 10 vòng muối)
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
