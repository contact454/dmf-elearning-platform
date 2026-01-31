/**
 * Idempotency Store Tests (Kiểm tra Kho Idempotency)
 * 
 * Tests idempotency store behavior.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryIdempotencyStore } from '../adapters/in-memory-idempotency-store';

describe('Idempotency Store (Kho Idempotency)', () => {
  let store: InMemoryIdempotencyStore;

  beforeEach(() => {
    store = new InMemoryIdempotencyStore();
  });

  it('should store and retrieve idempotency result (Phải lưu và lấy kết quả idempotency)', async () => {
    const key = 'command:corr-123';
    const result = {
      resultIds: { userId: 'user-123' },
      emittedEventIds: ['event-1'],
      timestamp: new Date().toISOString(),
    };

    await store.set(key, result);
    const retrieved = await store.get(key);

    expect(retrieved).toBeDefined();
    expect(retrieved?.resultIds.userId).toBe('user-123');
    expect(retrieved?.emittedEventIds).toEqual(['event-1']);
  });

  it('should return null for non-existent key (Phải trả về null cho khóa không tồn tại)', async () => {
    const retrieved = await store.get('non-existent');
    expect(retrieved).toBeNull();
  });

  it('should check existence correctly (Phải kiểm tra sự tồn tại đúng)', async () => {
    const key = 'command:corr-456';
    const result = {
      resultIds: { enrollmentId: 'enroll-123' },
      emittedEventIds: ['event-2'],
      timestamp: new Date().toISOString(),
    };

    expect(await store.exists(key)).toBe(false);

    await store.set(key, result);
    expect(await store.exists(key)).toBe(true);
  });
});
