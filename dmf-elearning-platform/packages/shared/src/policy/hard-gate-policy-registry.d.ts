/**
 * Hard Gate Policy Registry (Đăng ký Chính sách Hard Gate)
 *
 * In-memory policy registry for hard gate switches.
 * Moved to shared to avoid circular dependency between @dmf/ops and @dmf/evidence.
 */
export type HardGateScope = 'global' | 'course' | 'lesson' | 'cohort';
export interface HardGatePolicy {
    scope: HardGateScope;
    scopeId?: string;
    enabled: boolean;
    updatedAt: string;
    updatedBy: string;
    reason?: string;
}
declare class HardGatePolicyRegistry {
    private policies;
    /**
     * Get policy key
     */
    private getKey;
    /**
     * Set policy
     */
    setPolicy(policy: HardGatePolicy): void;
    /**
     * Get policy
     */
    getPolicy(scope: HardGateScope, scopeId?: string): HardGatePolicy | null;
    /**
     * Get all policies
     */
    getAllPolicies(): HardGatePolicy[];
    /**
     * Check if hard gate is enabled for a scope (with priority)
     *
     * Priority: lesson > course > cohort > global
     */
    isHardGateEnabled(lessonId?: string, courseId?: string, cohortId?: string): boolean;
}
export declare function getHardGatePolicyRegistry(): HardGatePolicyRegistry;
export {};
//# sourceMappingURL=hard-gate-policy-registry.d.ts.map