/**
 * In-memory Event Bus adapter (Bộ chuyển đổi Bus Sự kiện trong bộ nhớ)
 * 
 * Simple in-memory implementation for MVP.
 * Supports publish/subscribe with eventId deduplication (at-least-once simulation).
 */

import type { EventBus, Event, EventHandler } from '../event-bus.js';
import type { EventName } from '@dmf/contracts';

export class InMemoryEventBus implements EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private processedEventIds: Set<string> = new Set();
  private publishedEvents: Event[] = []; // Track published events for testing (Theo dõi sự kiện đã phát cho kiểm tra)

  /**
   * Emit event (Phát sự kiện)
   * 
   * Publishes event to all subscribers.
   * Deduplicates by eventId (at-least-once simulation).
   */
  async emit(event: Event): Promise<void> {
    const eventId = event.payload.eventId;

    // Dedupe by eventId (Dedupe theo eventId)
    if (this.processedEventIds.has(eventId)) {
      // Already processed, skip (Đã xử lý, bỏ qua)
      return;
    }

    // Mark as processed (Đánh dấu đã xử lý)
    this.processedEventIds.add(eventId);

    // Track published event (for testing) (Theo dõi sự kiện đã phát - cho kiểm tra)
    this.publishedEvents.push(event);

    // Find matching handlers (Tìm các handler khớp)
    const handlers = this.findHandlers(event.eventName);

    // Call all handlers (Gọi tất cả handlers)
    await Promise.all(
      handlers.map((handler) =>
        handler(event).catch((err) => {
          console.error(`Event handler error for ${event.eventName}:`, err);
        })
      )
    );
  }

  /**
   * Subscribe to events (Đăng ký sự kiện)
   */
  async subscribe(eventName: EventName | string, handler: EventHandler): Promise<void> {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }
    this.handlers.get(eventName)!.add(handler);
  }

  /**
   * Unsubscribe from events (Hủy đăng ký sự kiện)
   */
  async unsubscribe(eventName: EventName | string, handler: EventHandler): Promise<void> {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Find handlers for event name (Tìm handlers cho tên sự kiện)
   */
  private findHandlers(eventName: EventName | string): EventHandler[] {
    const handlers: EventHandler[] = [];

    // Exact match (Khớp chính xác)
    const exactHandlers = this.handlers.get(eventName);
    if (exactHandlers) {
      handlers.push(...Array.from(exactHandlers));
    }

    // Wildcard match (Khớp ký tự đại diện)
    for (const [pattern, patternHandlers] of this.handlers.entries()) {
      if (pattern.includes('*') && this.matchesPattern(eventName, pattern)) {
        handlers.push(...Array.from(patternHandlers));
      }
    }

    return handlers;
  }

  /**
   * Check if event name matches pattern (Kiểm tra tên sự kiện khớp mẫu)
   */
  private matchesPattern(eventName: string, pattern: string): boolean {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(eventName);
  }

  /**
   * Clear processed events (for testing) (Xóa sự kiện đã xử lý - cho kiểm tra)
   */
  clearProcessedEvents(): void {
    this.processedEventIds.clear();
    this.publishedEvents = [];
  }

  /**
   * Get published events (for testing) (Lấy sự kiện đã phát - cho kiểm tra)
   */
  getPublishedEvents(): Event[] {
    return [...this.publishedEvents];
  }
}
