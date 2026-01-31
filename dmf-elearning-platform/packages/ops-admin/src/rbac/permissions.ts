/**
 * Permission Model (Mô hình Quyền)
 * 
 * Static permission registry - no DB, declarative.
 */

export type Permission =
  // Learner permissions
  | 'learner.read.own'
  | 'learner.write.own'
  | 'learner.submit.own'
  | 'learner.view.own.progress'
  // Teacher permissions
  | 'teacher.read.assigned'
  | 'teacher.evaluate.assigned'
  | 'teacher.view.assigned.progress'
  // Mentor permissions
  | 'mentor.read.assigned'
  | 'mentor.review.assigned'
  | 'mentor.view.assigned.progress'
  // Admin permissions
  | 'admin.read.all'
  | 'admin.manage.policy'
  | 'admin.manage.content'
  | 'admin.manage.rbac'
  | 'admin.view.metrics'
  | 'admin.view.audit';

/**
 * Permission metadata
 */
export interface PermissionMetadata {
  id: Permission;
  name: string;
  description: string;
  category: 'learner' | 'teacher' | 'mentor' | 'admin';
}

/**
 * Permission registry (static)
 */
export const PERMISSIONS: Record<Permission, PermissionMetadata> = {
  // Learner
  'learner.read.own': {
    id: 'learner.read.own',
    name: 'Read Own Content',
    description: 'Read own learning content and progress',
    category: 'learner',
  },
  'learner.write.own': {
    id: 'learner.write.own',
    name: 'Write Own Content',
    description: 'Create and update own learning content',
    category: 'learner',
  },
  'learner.submit.own': {
    id: 'learner.submit.own',
    name: 'Submit Own Activities',
    description: 'Submit own learning activities',
    category: 'learner',
  },
  'learner.view.own.progress': {
    id: 'learner.view.own.progress',
    name: 'View Own Progress',
    description: 'View own learning progress and dashboard',
    category: 'learner',
  },
  // Teacher
  'teacher.read.assigned': {
    id: 'teacher.read.assigned',
    name: 'Read Assigned Content',
    description: 'Read content assigned to teacher',
    category: 'teacher',
  },
  'teacher.evaluate.assigned': {
    id: 'teacher.evaluate.assigned',
    name: 'Evaluate Assigned',
    description: 'Evaluate and grade assigned learners',
    category: 'teacher',
  },
  'teacher.view.assigned.progress': {
    id: 'teacher.view.assigned.progress',
    name: 'View Assigned Progress',
    description: 'View progress of assigned learners',
    category: 'teacher',
  },
  // Mentor
  'mentor.read.assigned': {
    id: 'mentor.read.assigned',
    name: 'Read Assigned Content',
    description: 'Read content assigned to mentor',
    category: 'mentor',
  },
  'mentor.review.assigned': {
    id: 'mentor.review.assigned',
    name: 'Review Assigned',
    description: 'Review and provide feedback to assigned learners',
    category: 'mentor',
  },
  'mentor.view.assigned.progress': {
    id: 'mentor.view.assigned.progress',
    name: 'View Assigned Progress',
    description: 'View progress of assigned learners',
    category: 'mentor',
  },
  // Admin
  'admin.read.all': {
    id: 'admin.read.all',
    name: 'Read All',
    description: 'Read all content and data',
    category: 'admin',
  },
  'admin.manage.policy': {
    id: 'admin.manage.policy',
    name: 'Manage Policies',
    description: 'Create, update, and activate policies',
    category: 'admin',
  },
  'admin.manage.content': {
    id: 'admin.manage.content',
    name: 'Manage Content',
    description: 'Manage learning content and curriculum',
    category: 'admin',
  },
  'admin.manage.rbac': {
    id: 'admin.manage.rbac',
    name: 'Manage RBAC',
    description: 'Manage roles and permissions',
    category: 'admin',
  },
  'admin.view.metrics': {
    id: 'admin.view.metrics',
    name: 'View Metrics',
    description: 'View system metrics and analytics',
    category: 'admin',
  },
  'admin.view.audit': {
    id: 'admin.view.audit',
    name: 'View Audit Logs',
    description: 'View audit logs and compliance data',
    category: 'admin',
  },
};

/**
 * Get all permissions
 */
export function getAllPermissions(): Permission[] {
  return Object.keys(PERMISSIONS) as Permission[];
}

/**
 * Get permission metadata
 */
export function getPermissionMetadata(permission: Permission): PermissionMetadata {
  return PERMISSIONS[permission];
}
