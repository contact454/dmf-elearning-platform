/**
 * Event emitter (Bộ phát Sự kiện)
 * 
 * Wrapper around EventBus for emitting events.
 */

import type { EventBus, Event } from '@dmf/infra';
import type { AuditLogger } from '@dmf/infra';

export class EventEmitter {
  constructor(
    private eventBus: EventBus,
    private auditLogger?: AuditLogger
  ) {}

  /**
   * Emit event (Phát sự kiện)
   * 
   * @param event - Event to emit
   */
  async emit(event: Event): Promise<void> {
    await this.eventBus.emit(event);

    // Log event emission (Ghi log phát sự kiện)
    if (this.auditLogger) {
      const userId = (event.payload as any).userId;
      this.auditLogger.logEventEmitted(
        event.eventName,
        event.payload.eventId,
        userId
      );
    }
  }
}
