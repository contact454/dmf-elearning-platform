/**
 * In-memory Event Bus adapter (Bộ chuyển đổi Bus Sự kiện trong bộ nhớ)
 *
 * Simple in-memory implementation for MVP.
 * Supports publish/subscribe with eventId deduplication (at-least-once simulation).
 */
import type { EventBus, Event, EventHandler } from '../event-bus.js';
import type { EventName } from '@dmf/contracts';
export declare class InMemoryEventBus implements EventBus {
    private handlers;
    private processedEventIds;
    private publishedEvents;
    /**
     * Emit event (Phát sự kiện)
     *
     * Publishes event to all subscribers.
     * Deduplicates by eventId (at-least-once simulation).
     */
    emit(event: Event): Promise<void>;
    /**
     * Subscribe to events (Đăng ký sự kiện)
     */
    subscribe(eventName: EventName | string, handler: EventHandler): Promise<void>;
    /**
     * Unsubscribe from events (Hủy đăng ký sự kiện)
     */
    unsubscribe(eventName: EventName | string, handler: EventHandler): Promise<void>;
    /**
     * Find handlers for event name (Tìm handlers cho tên sự kiện)
     */
    private findHandlers;
    /**
     * Check if event name matches pattern (Kiểm tra tên sự kiện khớp mẫu)
     */
    private matchesPattern;
    /**
     * Clear processed events (for testing) (Xóa sự kiện đã xử lý - cho kiểm tra)
     */
    clearProcessedEvents(): void;
    /**
     * Get published events (for testing) (Lấy sự kiện đã phát - cho kiểm tra)
     */
    getPublishedEvents(): Event[];
}
//# sourceMappingURL=in-memory-event-bus.d.ts.map