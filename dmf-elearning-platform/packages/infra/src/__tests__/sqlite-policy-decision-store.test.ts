/**
 * Unit tests for SQLite Policy Decision Store
 * 
 * Phase 2 Sprint 1: SQLite Persistence (Opt-in)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { SqlitePolicyDecisionStore } from '../adapters/sqlite-policy-decision-store.js';
import { createPolicyDecision } from '@dmf/ops';

describe('SqlitePolicyDecisionStore', () => {
  let db: Database.Database;
  let store: SqlitePolicyDecisionStore;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    store = new SqlitePolicyDecisionStore(db);
  });

  afterEach(() => {
    db.close();
  });

  it('should save and retrieve a policy decision', async () => {
    const decision = createPolicyDecision({
      action: 'lesson.complete',
      allowed: true,
      reason: 'Evidence requirements met',
      policyId: 'policy-1',
      actorUserId: 'user-1',
      correlationId: 'corr-1',
    });

    await store.save(decision);
    const retrieved = await store.findById(decision.decisionId);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.decisionId).toBe(decision.decisionId);
    expect(retrieved?.action).toBe('lesson.complete');
    expect(retrieved?.allowed).toBe(true);
  });

  it('should find decisions by policy ID', async () => {
    const decision1 = createPolicyDecision({
      action: 'lesson.complete',
      allowed: true,
      reason: 'Test',
      policyId: 'policy-1',
      actorUserId: 'user-1',
      correlationId: 'corr-1',
    });
    const decision2 = createPolicyDecision({
      action: 'lesson.start',
      allowed: true,
      reason: 'Test',
      policyId: 'policy-1',
      actorUserId: 'user-1',
      correlationId: 'corr-2',
    });

    await store.save(decision1);
    await store.save(decision2);

    const found = await store.findByPolicyId('policy-1');
    expect(found).toHaveLength(2);
  });

  it('should find decisions by correlation ID', async () => {
    const decision = createPolicyDecision({
      action: 'lesson.complete',
      allowed: true,
      reason: 'Test',
      policyId: 'policy-1',
      actorUserId: 'user-1',
      correlationId: 'corr-1',
    });

    await store.save(decision);
    const found = await store.findByCorrelationId('corr-1');

    expect(found).toHaveLength(1);
    expect(found[0].correlationId).toBe('corr-1');
  });
});
