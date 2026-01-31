/**
 * Infrastructure adapters exports (Xuất Bộ chuyển đổi Hạ tầng)
 */

export * from './in-memory-event-bus.js';
export * from './in-memory-logger.js';
export * from './in-memory-database.js';
export * from './in-memory-idempotency-store.js';
export * from './in-memory-outbox.js';
export * from './in-memory-http-client.js';
export * from './shared-event-bus.js';
export * from './sqlite-database.js';
export * from './sqlite-outbox.js';
export * from './sqlite-idempotency-store.js';

// Phase 2 Sprint 1: SQLite Persistence (Opt-in)
export * from './sqlite-policy-decision-store.js';
export * from './sqlite-audit-store.js';
export * from './sqlite-evidence-store.js';
export * from './sqlite-snapshot-store.js';
export * from './in-memory-policy-decision-store.js';
export * from './in-memory-audit-store.js';
export * from './in-memory-evidence-store.js';
export * from './in-memory-snapshot-store.js';
export * from './store-factory.js';

// Explicitly export emitViaOutbox for ESM compatibility (Xuất rõ ràng emitViaOutbox để tương thích ESM)
export { emitViaOutbox } from './outbox-event-emitter.js';