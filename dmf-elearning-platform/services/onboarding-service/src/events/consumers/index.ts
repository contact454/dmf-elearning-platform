/**
 * Event Consumers (Bộ nhận Sự kiện)
 * onboarding-service does not update derived states (no consumers)
 */

import type { EventBus } from '@dmf/infra';

export function setupEventConsumers(_context: { logger: any; eventEmitter: EventBus }): void {
  // onboarding-service does not consume events (only emits)
}
