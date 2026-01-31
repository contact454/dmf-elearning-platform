/**
 * Mock Event Bus (Bus Sự kiện Giả lập)
 * For testing - in-memory implementation
 */

import type { EventBus, Event, EventHandler } from '@dmf/infra';
import type { EventName } from '@dmf/contracts';

export class MockEventBus implements EventBus {
  private handlers: Map<string, Array<EventHandler>> = new Map();
  private emittedEvents: Event[] = [];

  async emit(event: Event): Promise<void> {
    this.emittedEvents.push(event);
    // Call handlers for exact event name match
    const exactHandlers = this.handlers.get(event.eventName) || [];
    await Promise.all(exactHandlers.map((handler) => handler(event)));
    
    // Also check for wildcard handlers (if pattern matching is needed)
    // For now, only exact match is supported
  }

  async subscribe(eventName: EventName | string, handler: EventHandler): Promise<void> {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  async unsubscribe(eventName: EventName | string, handler: EventHandler): Promise<void> {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Get emitted events (Lấy sự kiện đã phát)
   * For test assertions
   */
  getEmittedEvents(): Event[] {
    return [...this.emittedEvents];
  }

  /**
   * Clear emitted events (Xóa sự kiện đã phát)
   * For test cleanup
   */
  clear(): void {
    this.emittedEvents = [];
    this.handlers.clear();
  }
}
