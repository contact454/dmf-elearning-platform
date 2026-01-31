/**
 * Policy Registry (Đăng ký Chính sách)
 * 
 * In-memory policy registry with versioning.
 */

import type { Policy, PolicyVersion, PolicyStatus } from './policy.types.js';

class PolicyRegistry {
  private policies = new Map<string, Policy>(); // Current active version per policyId
  private versions = new Map<string, PolicyVersion[]>(); // Version history per policyId

  /**
   * Create or update policy (creates new version)
   */
  createPolicy(policy: Omit<Policy, 'version' | 'createdAt'>, createdBy: string): Policy {
    const existing = this.policies.get(policy.id);
    const newVersion = existing ? existing.version + 1 : 1;

    const newPolicy: Policy = {
      ...policy,
      version: newVersion,
      createdAt: new Date().toISOString(),
      createdBy,
    };

    // Store current version
    this.policies.set(policy.id, newPolicy);

    // Store version history
    const versionHistory = this.versions.get(policy.id) || [];
    versionHistory.push({
      policyId: policy.id,
      version: newVersion,
      payload: { ...newPolicy },
      createdAt: newPolicy.createdAt,
      createdBy,
    });
    this.versions.set(policy.id, versionHistory);

    return newPolicy;
  }

  /**
   * Get policy (current version)
   */
  getPolicy(policyId: string): Policy | null {
    return this.policies.get(policyId) || null;
  }

  /**
   * Get all policies
   */
  getAllPolicies(): Policy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Get policies by status
   */
  getPoliciesByStatus(status: PolicyStatus): Policy[] {
    return Array.from(this.policies.values()).filter((p) => p.status === status);
  }

  /**
   * Activate policy (set status to active)
   */
  activatePolicy(policyId: string, actorUserId: string): Policy | null {
    const policy = this.policies.get(policyId);
    if (!policy) {
      return null;
    }

    const updatedPolicy: Policy = {
      ...policy,
      status: 'active',
    };

    this.policies.set(policyId, updatedPolicy);

    // Create new version for status change
    const versionHistory = this.versions.get(policyId) || [];
    versionHistory.push({
      policyId,
      version: policy.version + 1,
      payload: { ...updatedPolicy },
      createdAt: new Date().toISOString(),
      createdBy: actorUserId,
    });
    this.versions.set(policyId, versionHistory);

    return updatedPolicy;
  }

  /**
   * Get version history for a policy
   */
  getVersionHistory(policyId: string): PolicyVersion[] {
    return this.versions.get(policyId) || [];
  }

  /**
   * Get specific version of a policy
   */
  getPolicyVersion(policyId: string, version: number): PolicyVersion | null {
    const history = this.versions.get(policyId);
    if (!history) {
      return null;
    }

    return history.find((v) => v.version === version) || null;
  }
}

// Singleton instance
let registryInstance: PolicyRegistry | null = null;

export function getPolicyRegistry(): PolicyRegistry {
  if (!registryInstance) {
    registryInstance = new PolicyRegistry();
  }
  return registryInstance;
}
