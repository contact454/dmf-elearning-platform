/**
 * Hard Gate Policy Registry (Đăng ký Chính sách Hard Gate)
 *
 * In-memory policy registry for hard gate switches.
 * Moved to shared to avoid circular dependency between @dmf/ops and @dmf/evidence.
 */
class HardGatePolicyRegistry {
    policies = new Map(); // key: scope:scopeId
    /**
     * Get policy key
     */
    getKey(scope, scopeId) {
        return scopeId ? `${scope}:${scopeId}` : scope;
    }
    /**
     * Set policy
     */
    setPolicy(policy) {
        const key = this.getKey(policy.scope, policy.scopeId);
        this.policies.set(key, policy);
    }
    /**
     * Get policy
     */
    getPolicy(scope, scopeId) {
        const key = this.getKey(scope, scopeId);
        return this.policies.get(key) || null;
    }
    /**
     * Get all policies
     */
    getAllPolicies() {
        return Array.from(this.policies.values());
    }
    /**
     * Check if hard gate is enabled for a scope (with priority)
     *
     * Priority: lesson > course > cohort > global
     */
    isHardGateEnabled(lessonId, courseId, cohortId) {
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
let registryInstance = null;
export function getHardGatePolicyRegistry() {
    if (!registryInstance) {
        registryInstance = new HardGatePolicyRegistry();
    }
    return registryInstance;
}
//# sourceMappingURL=hard-gate-policy-registry.js.map