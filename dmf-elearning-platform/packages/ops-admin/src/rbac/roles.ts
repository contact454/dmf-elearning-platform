/**
 * Role Definitions (Định nghĩa Vai trò)
 * 
 * Static role registry with permission assignments.
 */

import type { Permission } from './permissions.js';
import { getAllPermissions } from './permissions.js';

export type Role = 'learner' | 'teacher' | 'mentor' | 'admin' | 'super_admin';

export interface RoleDefinition {
  id: Role;
  name: string;
  description: string;
  permissions: Permission[];
}

/**
 * Role definitions with permission assignments
 */
export const ROLES: Record<Role, RoleDefinition> = {
  learner: {
    id: 'learner',
    name: 'Learner',
    description: 'Standard learner role',
    permissions: [
      'learner.read.own',
      'learner.write.own',
      'learner.submit.own',
      'learner.view.own.progress',
    ],
  },
  teacher: {
    id: 'teacher',
    name: 'Teacher',
    description: 'Teacher role with evaluation permissions',
    permissions: [
      'learner.read.own', // Teachers can read their own content too
      'learner.view.own.progress',
      'teacher.read.assigned',
      'teacher.evaluate.assigned',
      'teacher.view.assigned.progress',
    ],
  },
  mentor: {
    id: 'mentor',
    name: 'Mentor',
    description: 'Mentor role with review permissions',
    permissions: [
      'learner.read.own',
      'learner.view.own.progress',
      'mentor.read.assigned',
      'mentor.review.assigned',
      'mentor.view.assigned.progress',
    ],
  },
  admin: {
    id: 'admin',
    name: 'Admin',
    description: 'Administrator role with management permissions',
    permissions: [
      'admin.read.all',
      'admin.manage.policy',
      'admin.manage.content',
      'admin.view.metrics',
      'admin.view.audit',
    ],
  },
  super_admin: {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Super administrator with all permissions',
    permissions: getAllPermissions(), // All permissions
  },
};

/**
 * Get role definition
 */
export function getRole(roleId: Role): RoleDefinition {
  return ROLES[roleId];
}

/**
 * Get all roles
 */
export function getAllRoles(): Role[] {
  return Object.keys(ROLES) as Role[];
}

/**
 * Check if role has permission
 */
export function roleHasPermission(roleId: Role, permission: Permission): boolean {
  const role = getRole(roleId);
  return role.permissions.includes(permission);
}
