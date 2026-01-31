/**
 * Policy Decision: Why an action was blocked/allowed
 * 
 * Phase 2 Track C: Ops Visibility & Policy Enforcement
 * 
 * Records the decision-making process for policy enforcement.
 * This enables:
 * - Audit trail: Why was action X blocked/allowed?
 * - Debugging: What policy caused this decision?
 * - Analytics: Which policies are most frequently triggered?
 */

/**
 * Policy decision record
 * 
 * Created whenever a policy is evaluated for an action.
 */
export type PolicyDecision = {
  /**
   * Unique decision ID
   */
  decisionId: string;

  /**
   * Action being evaluated (e.g., 'lesson.complete', 'lesson.start', 'b1.speaking')
   */
  action: string;

  /**
   * Whether the action was allowed
   */
  allowed: boolean;

  /**
   * Human-readable reason for the decision
   * 
   * Examples:
   * - "Allowed: Evidence requirements met"
   * - "Blocked: Missing required speaking evidence"
   * - "Allowed: Soft gate triggered (warning only)"
   */
  reason: string;

  /**
   * Policy ID that made this decision
   */
  policyId: string;

  /**
   * Gate type (if enforcement was triggered)
   * 
   * - 'soft': Warning logged, action allowed
   * - 'hard': Action blocked
   * - undefined: No gate triggered (action allowed without enforcement)
   */
  gateType?: 'soft' | 'hard';

  /**
   * Timestamp when decision was made
   */
  timestamp: string;

  /**
   * User ID who triggered the action
   */
  actorUserId: string;

  /**
   * Correlation ID for tracing
   */
  correlationId: string;

  /**
   * Additional context (optional)
   * 
   * May include:
   * - Missing evidence types
   * - Current evidence counts
   * - Policy configuration at time of decision
   */
  metadata?: Record<string, unknown>;
};

/**
 * Create a policy decision record
 */
export function createPolicyDecision(
  params: Omit<PolicyDecision, 'decisionId' | 'timestamp'>
): PolicyDecision {
  return {
    decisionId: `decision-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...params,
  };
}

/**
 * Policy decision summary (for analytics)
 */
export type PolicyDecisionSummary = {
  policyId: string;
  action: string;
  totalDecisions: number;
  allowedCount: number;
  blockedCount: number;
  softGateCount: number;
  hardGateCount: number;
  lastDecisionAt?: string;
};

/**
 * Summarize policy decisions
 */
export function summarizePolicyDecisions(
  decisions: PolicyDecision[]
): PolicyDecisionSummary[] {
  const byPolicy = new Map<string, PolicyDecision[]>();

  for (const decision of decisions) {
    const key = `${decision.policyId}:${decision.action}`;
    if (!byPolicy.has(key)) {
      byPolicy.set(key, []);
    }
    byPolicy.get(key)!.push(decision);
  }

  const summaries: PolicyDecisionSummary[] = [];

  for (const [key, policyDecisions] of byPolicy.entries()) {
    const [policyId, action] = key.split(':');
    const allowed = policyDecisions.filter((d) => d.allowed);
    const blocked = policyDecisions.filter((d) => !d.allowed);
    const softGate = policyDecisions.filter((d) => d.gateType === 'soft');
    const hardGate = policyDecisions.filter((d) => d.gateType === 'hard');
    const lastDecision = policyDecisions
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];

    summaries.push({
      policyId,
      action,
      totalDecisions: policyDecisions.length,
      allowedCount: allowed.length,
      blockedCount: blocked.length,
      softGateCount: softGate.length,
      hardGateCount: hardGate.length,
      lastDecisionAt: lastDecision?.timestamp,
    });
  }

  return summaries;
}