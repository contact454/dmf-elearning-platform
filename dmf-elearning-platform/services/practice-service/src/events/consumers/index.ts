/**
 * Event Consumers Setup (Thiết lập Bộ nhận Sự kiện)
 * practice-service does NOT update derived states (no consumers here)
 * This service only emits events, does not consume
 */

import type { EventBus } from '@dmf/infra';

export function setupEventConsumers(_context: { logger: any; eventEmitter: EventBus }): void {
  // practice-service does not consume events (only emits)
  // Derived states (ProgressState, MasteryState) are updated by progress-service and motivation-progress-service
}
