/**
 * Policy Types (Các Loại Chính sách)
 * 
 * Type definitions for policy system.
 */

export type PolicyStatus = 'draft' | 'active' | 'deprecated';

export type PolicyScope = 'learning' | 'assessment' | 'curriculum' | 'rbac' | 'system';

export interface PolicyRule {
  type: string;
  [key: string]: unknown;
}

export interface Policy {
  id: string;
  version: number;
  scope: PolicyScope;
  appliesTo: string[]; // Role IDs or user IDs
  rule: PolicyRule;
  status: PolicyStatus;
  createdAt: string;
  createdBy: string;
  description?: string;
}

export interface PolicyVersion {
  policyId: string;
  version: number;
  payload: Policy;
  createdAt: string;
  createdBy: string;
}
