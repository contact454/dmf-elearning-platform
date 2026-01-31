/**
 * Authorization test helpers (Trợ giúp Kiểm tra Phân quyền)
 * 
 * Utilities for testing authorization checks.
 */

import { forbidRole } from '@dmf/shared';
import { UserRole } from '@dmf/shared';

/**
 * Test helper: Expect 403 Forbidden (Trợ giúp Kiểm tra: Mong đợi 403)
 * 
 * @param fn - Function that should throw 403
 * @returns Promise that resolves if 403 is thrown
 */
export async function expectForbidden(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    throw new Error('Expected 403 Forbidden but no error was thrown');
  } catch (error: any) {
    if (error.statusCode === 403 || error.code === 'FORBIDDEN') {
      return; // Expected
    }
    throw error; // Unexpected error
  }
}

/**
 * Test helper: Expect 404 NotFound (Trợ giúp Kiểm tra: Mong đợi 404)
 * 
 * @param fn - Function that should throw 404
 * @returns Promise that resolves if 404 is thrown
 */
export async function expectNotFound(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    throw new Error('Expected 404 NotFound but no error was thrown');
  } catch (error: any) {
    if (error.statusCode === 404 || error.code === 'NOT_FOUND') {
      return; // Expected
    }
    throw error; // Unexpected error
  }
}

/**
 * Test helper: Verify role check (Trợ giúp Kiểm tra: Xác minh kiểm tra vai trò)
 * 
 * @param role - Role to test (string, will be cast to UserRole)
 * @param allowedRoles - Allowed roles (array of UserRole)
 * @returns true if role is allowed, false otherwise
 */
export function verifyRoleCheck(role: string, allowedRoles: UserRole[]): boolean {
  try {
    // Cast role to UserRole (test helper assumes valid role string)
    forbidRole(role as UserRole, allowedRoles);
    return true;
  } catch {
    return false;
  }
}

/**
 * Test helper: Verify ownership check (Trợ giúp Kiểm tra: Xác minh kiểm tra sở hữu)
 * 
 * @param entityUserId - Entity user ID
 * @param authenticatedUserId - Authenticated user ID
 * @returns true if ownership check passes, false otherwise
 */
export function verifyOwnershipCheck(
  entityUserId: string,
  authenticatedUserId: string
): boolean {
  return entityUserId === authenticatedUserId;
}
