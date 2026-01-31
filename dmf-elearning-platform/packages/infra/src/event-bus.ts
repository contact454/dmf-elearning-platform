/**
 * Event Bus interface (Giao diện Bus Sự kiện)
 * 
 * This interface defines the contract for event bus implementations.
 * Services implement adapters (e.g., RabbitMQ, Kafka, in-memory).
 */

import type { EventName } from '@dmf/contracts';

/**
 * Event payload (Tải trọng Sự kiện)
 * 
 * Generic event payload structure.
 * Event-specific payloads are defined in @dmf/contracts.
 */
export interface EventPayload {
  eventId: string;
  occurredAt: string; // ISO 8601
  correlationId?: string;
  [key: string]: unknown; // Event-specific fields (IDs only)
}

/**
 * Event (Sự kiện)
 */
export interface Event {
  eventName: EventName;
  payload: EventPayload;
}

/**
 * Event handler (Bộ xử lý Sự kiện)
 * 
 * Function that handles an event.
 */
export type EventHandler = (event: Event) => Promise<void>;

/**
 * Event Bus interface (Giao diện Bus Sự kiện)
 * 
 * Services implement this interface with concrete adapters.
 */
export interface EventBus {
  /**
   * Emit event (Phát sự kiện)
   * 
   * Publishes an event to the event bus.
   * 
   * @param event - Event to emit
   * @returns Promise that resolves when event is published
   */
  emit(event: Event): Promise<void>;

  /**
   * Subscribe to events (Đăng ký sự kiện)
   * 
   * Subscribes to events matching the event name pattern.
   * 
   * @param eventName - Event name or pattern
   * @param handler - Event handler function
   * @returns Promise that resolves when subscription is registered
   */
  subscribe(eventName: EventName | string, handler: EventHandler): Promise<void>;

  /**
   * Unsubscribe from events (Hủy đăng ký sự kiện)
   * 
   * @param eventName - Event name or pattern
   * @param handler - Event handler function to remove
   * @returns Promise that resolves when unsubscription is complete
   */
  unsubscribe(eventName: EventName | string, handler: EventHandler): Promise<void>;
}
