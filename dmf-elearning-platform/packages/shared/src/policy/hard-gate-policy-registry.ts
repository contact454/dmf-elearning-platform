/**
 * Hard Gate Policy Registry (Đăng ký Chính sách Hard Gate)
 * 
 * In-memory policy registry for hard gate switches.
 * Moved to shared to avoid circular dependency between @dmf/ops and @dmf/evidence.
 */

export type HardGateScope = 'global' | 'course' | 'lesson' | 'cohort';

export interface HardGatePolicy {
  scope: HardGateScope;
  scopeId?: string; // undefined for global
  enabled: boolean;
  updatedAt: string; // ISO 8601
  updatedBy: string;
  reason?: string;
}

class HardGatePolicyRegistry {
  private policies = new Map<string, HardGatePolicy>(); // key: scope:scopeId

  /**
   * Get policy key
   */
  private getKey(scope: HardGateScope, scopeId?: string): string {
    return scopeId ? `${scope}:${scopeId}` : scope;
  }

  /**
   * Set policy
   */
  setPolicy(policy: HardGatePolicy): void {
    const key = this.getKey(policy.scope, policy.scopeId);
    this.policies.set(key, policy);
  }

  /**
   * Get policy
   */
  getPolicy(scope: HardGateScope, scopeId?: string): HardGatePolicy | null {
    const key = this.getKey(scope, scopeId);
    return this.policies.get(key) || null;
  }

  /**
   * Get all policies
   */
  getAllPolicies(): HardGatePolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Check if hard gate is enabled for a scope (with priority)
   * 
   * Priority: lesson > course > cohort > global
   */
  isHardGateEnabled(lessonId?: string, courseId?: string, cohortId?: string): boolean {
    // Check lesson scope
    if (lessonId) {
      const lessonPolicy = this.getPolicy('lesson', lessonId);
      if (lessonPolicy) {
        return lessonPolicy.enabled;
      }
    }

    // Check course scope
    if (courseId) {
      const coursePolicy = this.getPolicy('course', courseId);
      if (coursePolicy) {
        return coursePolicy.enabled;
      }
    }

    // Check cohort scope
    if (cohortId) {
      const cohortPolicy = this.getPolicy('cohort', cohortId);
      if (cohortPolicy) {
        return cohortPolicy.enabled;
      }
    }

    // Check global scope
    const globalPolicy = this.getPolicy('global');
    if (globalPolicy) {
      return globalPolicy.enabled;
    }

    // Default: false
    return false;
  }
}

// Singleton instance
let registryInstance: HardGatePolicyRegistry | null = null;

export function getHardGatePolicyRegistry(): HardGatePolicyRegistry {
  if (!registryInstance) {
    registryInstance = new HardGatePolicyRegistry();
  }
  return registryInstance;
}
