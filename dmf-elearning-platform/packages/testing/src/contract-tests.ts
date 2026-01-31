/**
 * Contract test utilities (Tiện ích Kiểm tra Hợp đồng)
 * 
 * Utilities for testing command and event schemas.
 */

import { z } from 'zod';
import { commandRegistry, eventRegistry } from '@dmf/contracts';

/**
 * Validate command payload (Xác thực tải trọng lệnh)
 * 
 * @param commandName - Command name
 * @param payload - Command payload
 * @returns Validation result
 */
export function validateCommand(
  commandName: string,
  payload: unknown
): { valid: boolean; error?: z.ZodError } {
  const schema = commandRegistry[commandName];
  if (!schema) {
    throw new Error(`Command '${commandName}' not found in registry`);
  }

  const result = schema.safeParse(payload);
  if (!result.success) {
    return { valid: false, error: result.error };
  }

  return { valid: true };
}

/**
 * Validate event payload (Xác thực tải trọng sự kiện)
 * 
 * @param eventName - Event name
 * @param payload - Event payload
 * @returns Validation result
 */
export function validateEvent(
  eventName: string,
  payload: unknown
): { valid: boolean; error?: z.ZodError } {
  const schema = eventRegistry[eventName];
  if (!schema) {
    throw new Error(`Event '${eventName}' not found in registry`);
  }

  const result = schema.safeParse({ eventName, payload });
  if (!result.success) {
    return { valid: false, error: result.error };
  }

  return { valid: true };
}

/**
 * Assert command is valid (Khẳng định lệnh hợp lệ)
 * 
 * @param commandName - Command name
 * @param payload - Command payload
 * @throws Error if command is invalid
 */
export function assertCommandValid(commandName: string, payload: unknown): void {
  const result = validateCommand(commandName, payload);
  if (!result.valid) {
    throw new Error(
      `Command '${commandName}' is invalid: ${result.error?.message}`
    );
  }
}

/**
 * Assert event is valid (Khẳng định sự kiện hợp lệ)
 * 
 * @param eventName - Event name
 * @param payload - Event payload
 * @throws Error if event is invalid
 */
export function assertEventValid(eventName: string, payload: unknown): void {
  const result = validateEvent(eventName, payload);
  if (!result.valid) {
    throw new Error(
      `Event '${eventName}' is invalid: ${result.error?.message}`
    );
  }
}
