/**
 * Outbox Event Emitter (Bộ phát Sự kiện Outbox)
 *
 * Helper to safely emit events via outbox pattern (write-then-emit).
 * Ensures events are not emitted twice even on retry.
 */
import type { EventBus, Event } from '../event-bus.js';
import type { Outbox } from '../outbox.js';
/**
 * Safely emit event via outbox (Phát sự kiện an toàn qua outbox)
 *
 * Flow:
 * 1. Check if event already published (by eventId)
 * 2. If not, create outbox record as pending
 * 3. Publish event
 * 4. Mark outbox as published
 *
 * On retry: if eventId already published, skip emission.
 */
export declare function emitViaOutbox(event: Event, eventBus: EventBus, outbox: Outbox, commandKey?: string): Promise<void>;
//# sourceMappingURL=outbox-event-emitter.d.ts.map