/**
 * Outbox Safety Tests (Kiểm tra An toàn Outbox)
 * 
 * Tests that outbox prevents duplicate event emissions.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryEventBus } from '../adapters/in-memory-event-bus';
import { InMemoryLogger } from '../adapters/in-memory-logger';
import { InMemoryOutbox } from '../adapters/in-memory-outbox';
import { emitViaOutbox } from '../adapters/outbox-event-emitter';

describe('Outbox Safety (An toàn Outbox)', () => {
  let eventBus: InMemoryEventBus;
  let logger: InMemoryLogger;
  let outbox: InMemoryOutbox;

  beforeEach(() => {
    logger = new InMemoryLogger();
    eventBus = new InMemoryEventBus(logger);
    outbox = new InMemoryOutbox();
  });

  it('should emit event once on first call (Phải phát sự kiện một lần khi gọi lần đầu)', async () => {
    const event = {
      eventName: 'test.event' as any,
      payload: {
        eventId: 'event-1',
        occurredAt: new Date().toISOString(),
        userId: 'user-123' as any,
      },
    };

    await emitViaOutbox(event, eventBus, outbox, 'command-key-1');

    const publishedEvents = eventBus.getPublishedEvents();
    expect(publishedEvents.length).toBe(1);
    expect(publishedEvents[0].payload.eventId).toBe('event-1');
  });

  it('should not emit duplicate event on retry (Không phát sự kiện trùng khi thử lại)', async () => {
    const event = {
      eventName: 'test.event' as any,
      payload: {
        eventId: 'event-2',
        occurredAt: new Date().toISOString(),
        userId: 'user-456' as any,
      },
    };

    // First emission
    await emitViaOutbox(event, eventBus, outbox, 'command-key-2');
    const eventCountAfterFirst = eventBus.getPublishedEvents().length;

    // Retry with same eventId
    await emitViaOutbox(event, eventBus, outbox, 'command-key-2');

    // Event count should not increase
    expect(eventBus.getPublishedEvents().length).toBe(eventCountAfterFirst);
  });

  it('should mark outbox as published after emission (Phải đánh dấu outbox đã phát hành sau khi phát)', async () => {
    const event = {
      eventName: 'test.event' as any,
      payload: {
        eventId: 'event-3',
        occurredAt: new Date().toISOString(),
        userId: 'user-789' as any,
      },
    };

    await emitViaOutbox(event, eventBus, outbox, 'command-key-3');

    // Check outbox record
    const outboxRecord = await outbox.findByEventId('event-3');
    expect(outboxRecord).toBeDefined();
    expect(outboxRecord?.status).toBe('published');
  });
});
