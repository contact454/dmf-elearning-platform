/**
 * Authorization helpers (Trợ giúp Phân quyền)
 * 
 * These helpers enforce STEP 8B error semantics:
 * - 403 Forbidden: Role violations only
 * - 404 NotFound: Ownership failures (hide existence)
 */

import { UserRole } from '../types/enums';
import { makeForbidden, makeNotFound } from '../errors';

/**
 * Forbid role violation (Cấm vi phạm vai trò)
 * 
 * Throws 403 Forbidden if role is not allowed.
 * Used for role-based access control.
 * 
 * @param role - User role to check
 * @param allowedRoles - Array of allowed roles
 * @throws {Error} with StandardError shape
 */
export function forbidRole(role: string, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(role as UserRole)) {
    const error = makeForbidden(role);
    const err = new Error(error.message);
    (err as any).standardError = error;
    throw err;
  }
}

/**
 * Fail ownership check (Thất bại kiểm tra sở hữu)
 * 
 * Throws 404 NotFound to hide entity existence (per STEP 8B).
 * Used for ownership-based access control.
 * 
 * @param entity - Optional entity name for error details
 * @throws {Error} with StandardError shape
 */
export function failOwnership(entity?: string): void {
  const error = makeNotFound(entity || 'Resource');
  const err = new Error(error.message);
  (err as any).standardError = error;
  throw err;
}

/**
 * Check ownership (Kiểm tra sở hữu)
 * 
 * Returns true if entity belongs to user, false otherwise.
 * Does not throw; caller should call failOwnership() if check fails.
 * 
 * @param entityUserId - User ID from entity
 * @param authenticatedUserId - Authenticated user ID
 * @returns true if entity belongs to user
 */
export function checkOwnership(
  entityUserId: string,
  authenticatedUserId: string
): boolean {
  return entityUserId === authenticatedUserId;
}
