/**
 * Shared Event Bus for Dev Mode (Bus Sự kiện Chia sẻ cho Chế độ Phát triển)
 * 
 * Creates a singleton InMemoryEventBus instance shared across all services in dev mode.
 * Uses globalThis to ensure single instance even with ESM module duplication.
 */

import { InMemoryEventBus } from './in-memory-event-bus.js';
import type { EventBus } from '../event-bus.js';

// Use Symbol.for() for true cross-module singleton
const KEY = Symbol.for('dmf.shared.eventBus');
const g = globalThis as any;

if (!g[KEY]) {
  g[KEY] = new InMemoryEventBus();
}

export const sharedEventBus: EventBus = g[KEY];
