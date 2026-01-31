/**
 * Permission Diff Engine (Công cụ So sánh Quyền)
 * 
 * Compares permissions between roles or versions.
 */

import type { Permission } from './permissions.js';
import { getRole, type Role } from './roles.js';

export interface PermissionDiff {
  added: Permission[];
  removed: Permission[];
  unchanged: Permission[];
}

/**
 * Diff permissions between two roles
 */
export function diffRoles(roleA: Role, roleB: Role): PermissionDiff {
  const roleADef = getRole(roleA);
  const roleBDef = getRole(roleB);

  const permissionsA = new Set(roleADef.permissions);
  const permissionsB = new Set(roleBDef.permissions);

  const added: Permission[] = [];
  const removed: Permission[] = [];
  const unchanged: Permission[] = [];

  // Find added permissions (in B but not in A)
  for (const perm of permissionsB) {
    if (!permissionsA.has(perm)) {
      added.push(perm);
    } else {
      unchanged.push(perm);
    }
  }

  // Find removed permissions (in A but not in B)
  for (const perm of permissionsA) {
    if (!permissionsB.has(perm)) {
      removed.push(perm);
    }
  }

  return {
    added,
    removed,
    unchanged,
  };
}

/**
 * Diff permissions between two permission sets
 */
export function diffPermissions(
  permissionsA: Permission[],
  permissionsB: Permission[]
): PermissionDiff {
  const setA = new Set(permissionsA);
  const setB = new Set(permissionsB);

  const added: Permission[] = [];
  const removed: Permission[] = [];
  const unchanged: Permission[] = [];

  // Find added permissions
  for (const perm of setB) {
    if (!setA.has(perm)) {
      added.push(perm);
    } else {
      unchanged.push(perm);
    }
  }

  // Find removed permissions
  for (const perm of setA) {
    if (!setB.has(perm)) {
      removed.push(perm);
    }
  }

  return {
    added,
    removed,
    unchanged,
  };
}
