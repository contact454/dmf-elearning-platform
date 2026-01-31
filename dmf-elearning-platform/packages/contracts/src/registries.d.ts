/**
 * Command and Event Registries (Đăng ký Lệnh và Sự kiện)
 *
 * These registries enforce contract-first approach.
 * Any command/event not in registry will cause build error.
 */
import type { ZodSchema } from 'zod';
/**
 * Command Registry (Đăng ký Lệnh)
 *
 * Maps command names to Zod schemas for validation.
 * Build will fail if command not in registry.
 */
export declare const commandRegistry: Record<string, ZodSchema>;
/**
 * Event Registry (Đăng ký Sự kiện)
 *
 * Maps event names to Zod schemas for validation.
 * Build will fail if event not in registry.
 */
export declare const eventRegistry: Record<string, ZodSchema>;
/**
 * Command name type (Loại tên lệnh)
 *
 * TypeScript type for all valid command names.
 * Use this to ensure type safety.
 */
export type CommandName = keyof typeof commandRegistry;
/**
 * Event name type (Loại tên sự kiện)
 *
 * TypeScript type for all valid event names.
 * Use this to ensure type safety.
 */
export type EventName = keyof typeof eventRegistry;
//# sourceMappingURL=registries.d.ts.map