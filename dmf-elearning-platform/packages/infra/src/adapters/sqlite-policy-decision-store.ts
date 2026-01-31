/**
 * SQLite Policy Decision Store adapter
 * 
 * Phase 2 Sprint 1: SQLite Persistence (Opt-in)
 * 
 * Implements PolicyDecisionStore interface using SQLite.
 */

import Database from 'better-sqlite3';
import type { PolicyDecisionStore } from '../ports/PolicyDecisionStore.js';
import type { PolicyDecision } from '@dmf/ops';

export class SqlitePolicyDecisionStore implements PolicyDecisionStore {
  constructor(private db: Database.Database) {
    // Ensure table exists (migration should handle this, but defensive check)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ops_policy_decisions (
        id TEXT PRIMARY KEY,
        correlationId TEXT NOT NULL,
        actorType TEXT NOT NULL,
        actorUserId TEXT NOT NULL,
        decision TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_policy_decisions_correlation_id ON ops_policy_decisions(correlationId);
      CREATE INDEX IF NOT EXISTS idx_policy_decisions_actor_user_id ON ops_policy_decisions(actorUserId);
      CREATE INDEX IF NOT EXISTS idx_policy_decisions_created_at ON ops_policy_decisions(createdAt);
    `);
  }

  async save(decision: PolicyDecision): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO ops_policy_decisions (id, correlationId, actorType, actorUserId, decision, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const createdAt = new Date(decision.timestamp).getTime();
    stmt.run(
      decision.decisionId,
      decision.correlationId,
      'admin', // Default actorType (can be enhanced later)
      decision.actorUserId,
      JSON.stringify(decision),
      createdAt
    );
  }

  async findByPolicyId(policyId: string): Promise<PolicyDecision[]> {
    const stmt = this.db.prepare('SELECT decision FROM ops_policy_decisions WHERE decision LIKE ?');
    const results = stmt.all(`%"policyId":"${policyId}"%`) as Array<{ decision: string }>;
    return results.map((r) => JSON.parse(r.decision) as PolicyDecision);
  }

  async findByAction(action: string): Promise<PolicyDecision[]> {
    const stmt = this.db.prepare('SELECT decision FROM ops_policy_decisions WHERE decision LIKE ?');
    const results = stmt.all(`%"action":"${action}"%`) as Array<{ decision: string }>;
    return results.map((r) => JSON.parse(r.decision) as PolicyDecision);
  }

  async findByCorrelationId(correlationId: string): Promise<PolicyDecision[]> {
    const stmt = this.db.prepare('SELECT decision FROM ops_policy_decisions WHERE correlationId = ?');
    const results = stmt.all(correlationId) as Array<{ decision: string }>;
    return results.map((r) => JSON.parse(r.decision) as PolicyDecision);
  }

  async findByActorUserId(actorUserId: string): Promise<PolicyDecision[]> {
    const stmt = this.db.prepare('SELECT decision FROM ops_policy_decisions WHERE actorUserId = ?');
    const results = stmt.all(actorUserId) as Array<{ decision: string }>;
    return results.map((r) => JSON.parse(r.decision) as PolicyDecision);
  }

  async findByTimeRange(fromTimestamp: string, toTimestamp: string): Promise<PolicyDecision[]> {
    const fromTime = new Date(fromTimestamp).getTime();
    const toTime = new Date(toTimestamp).getTime();
    const stmt = this.db.prepare('SELECT decision FROM ops_policy_decisions WHERE createdAt >= ? AND createdAt <= ?');
    const results = stmt.all(fromTime, toTime) as Array<{ decision: string }>;
    return results.map((r) => JSON.parse(r.decision) as PolicyDecision);
  }

  async findById(decisionId: string): Promise<PolicyDecision | null> {
    const stmt = this.db.prepare('SELECT decision FROM ops_policy_decisions WHERE id = ?');
    const result = stmt.get(decisionId) as { decision: string } | undefined;
    return result ? (JSON.parse(result.decision) as PolicyDecision) : null;
  }
}
