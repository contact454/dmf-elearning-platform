/**
 * Contracts package exports (Xuất gói Hợp đồng)
 * 
 * This package contains command and event schemas (frozen from STEP 4.2, STEP 5C).
 * All command/event names must be in registries.
 */

// Commands (export all command schemas and types)
export * from './commands/index.js';

// Events (export all event schemas and types)
// Note: systemUserLoginSchema from events is excluded to avoid collision with command version
// Event schema is available via subpath: @dmf/contracts/events/system if needed
export * from './events/index.js';

// Registries (stable public API)
export { commandRegistry, eventRegistry, type CommandName, type EventName } from './registries.js';
