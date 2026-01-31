/**
 * Command Registry Tests (Kiểm tra Đăng ký Lệnh)
 * 
 * Ensures all command routes use commandRegistry schemas.
 */

import { describe, it, expect } from 'vitest';
import { commandRegistry } from '../registries';

/**
 * E2E commands that must be in registry (Các lệnh E2E phải có trong đăng ký)
 */
const E2E_COMMANDS = [
  'system.user.register',
  'system.user.login',
  'curriculum.course.enroll',
  'learning.lesson.start',
  'learning.activity.submit',
  'learning.lesson.complete',
];

describe('Command Registry (Đăng ký Lệnh)', () => {
  it('should have all E2E commands in registry (Phải có tất cả lệnh E2E trong đăng ký)', () => {
    for (const commandName of E2E_COMMANDS) {
      expect(commandRegistry[commandName]).toBeDefined();
      expect(typeof commandRegistry[commandName]).toBe('object');
    }
  });

  it('should validate command schemas are Zod schemas (Phải xác thực schema lệnh là Zod schema)', () => {
    for (const [commandName, schema] of Object.entries(commandRegistry)) {
      expect(schema).toBeDefined();
      // Check if it's a Zod schema (has _def property)
      expect((schema as any)._def).toBeDefined();
    }
  });
});
