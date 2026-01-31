/**
 * Event Emitter (Phát sự kiện)
 */

import type { EventBus, Event, EventHandler } from '@dmf/infra';

class InMemoryEventBus implements EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  async emit(event: Event): Promise<void> {
    const handlers = this.handlers.get(event.eventName) || new Set();
    // Await handlers sequentially
    for (const handler of handlers) {
      await handler(event);
    }
  }

  async subscribe(eventName: string, handler: EventHandler): Promise<void> {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }
    this.handlers.get(eventName)!.add(handler);
  }

  async unsubscribe(eventName: string, handler: EventHandler): Promise<void> {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      handlers.delete(handler);
    }
  }
}

export function createEventEmitter(): EventBus {
  return new InMemoryEventBus();
}
