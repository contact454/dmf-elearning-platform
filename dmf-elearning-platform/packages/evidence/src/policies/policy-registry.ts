/**
 * Evidence Policy Registry (Đăng ký Chính sách Bằng chứng)
 * 
 * In-memory policy registry with runtime configuration.
 */

import type { EvidencePolicy, EnforcementLevel } from '../enforcement/enforcement.types.js';
import { DEFAULT_POLICIES } from './default-policies.js';
import { DEFAULT_ENFORCEMENT_LEVEL } from '../enforcement/enforcement.types.js';

class EvidencePolicyRegistry {
  private policies = new Map<string, EvidencePolicy>();
  private enforcementLevel: EnforcementLevel = DEFAULT_ENFORCEMENT_LEVEL;

  constructor() {
    // Load default policies
    for (const policy of DEFAULT_POLICIES) {
      this.policies.set(policy.id, policy);
    }
  }

  /**
   * Get policy by ID
   */
  getPolicy(policyId: string): EvidencePolicy | null {
    return this.policies.get(policyId) || null;
  }

  /**
   * Get policies by action and scope
   */
  getPoliciesByAction(action: string, scope?: string): EvidencePolicy[] {
    const allPolicies = Array.from(this.policies.values());
    return allPolicies.filter(
      (p) => p.action === action && (scope === undefined || p.scope === scope)
    );
  }

  /**
   * Get all policies
   */
  getAllPolicies(): EvidencePolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Add or update policy
   */
  setPolicy(policy: EvidencePolicy): void {
    this.policies.set(policy.id, policy);
  }

  /**
   * Get current enforcement level
   */
  getEnforcementLevel(): EnforcementLevel {
    return this.enforcementLevel;
  }

  /**
   * Set enforcement level (runtime toggle)
   */
  setEnforcementLevel(level: EnforcementLevel): void {
    this.enforcementLevel = level;
  }
}

// Singleton instance
let registryInstance: EvidencePolicyRegistry | null = null;

export function getEvidencePolicyRegistry(): EvidencePolicyRegistry {
  if (!registryInstance) {
    registryInstance = new EvidencePolicyRegistry();
  }
  return registryInstance;
}
