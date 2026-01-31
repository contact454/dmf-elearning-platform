/**
 * In-Memory Policy Decision Store
 * 
 * Phase 2 Sprint 1: SQLite Persistence (Opt-in)
 * 
 * Default in-memory implementation (used when DMF_PERSISTENCE != 'sqlite').
 */

import type { PolicyDecisionStore } from '../ports/PolicyDecisionStore.js';
import type { PolicyDecision } from '@dmf/ops';

export class InMemoryPolicyDecisionStore implements PolicyDecisionStore {
  private decisions = new Map<string, PolicyDecision>();

  async save(decision: PolicyDecision): Promise<void> {
    this.decisions.set(decision.decisionId, decision);
  }

  async findByPolicyId(policyId: string): Promise<PolicyDecision[]> {
    return Array.from(this.decisions.values()).filter((d) => d.policyId === policyId);
  }

  async findByAction(action: string): Promise<PolicyDecision[]> {
    return Array.from(this.decisions.values()).filter((d) => d.action === action);
  }

  async findByCorrelationId(correlationId: string): Promise<PolicyDecision[]> {
    return Array.from(this.decisions.values()).filter((d) => d.correlationId === correlationId);
  }

  async findByActorUserId(actorUserId: string): Promise<PolicyDecision[]> {
    return Array.from(this.decisions.values()).filter((d) => d.actorUserId === actorUserId);
  }

  async findByTimeRange(fromTimestamp: string, toTimestamp: string): Promise<PolicyDecision[]> {
    const from = new Date(fromTimestamp).getTime();
    const to = new Date(toTimestamp).getTime();
    return Array.from(this.decisions.values()).filter((d) => {
      const ts = new Date(d.timestamp).getTime();
      return ts >= from && ts <= to;
    });
  }

  async findById(decisionId: string): Promise<PolicyDecision | null> {
    return this.decisions.get(decisionId) || null;
  }
}
