/**
 * Unit tests for SQLite Evidence Store
 * 
 * Phase 2 Sprint 1: SQLite Persistence (Opt-in)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { SqliteEvidenceStore } from '../adapters/sqlite-evidence-store.js';
import type { EvidenceItem } from '@dmf/evidence';
import { EvidenceStatus } from '@dmf/evidence';

describe('SqliteEvidenceStore', () => {
  let db: Database.Database;
  let store: SqliteEvidenceStore;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    store = new SqliteEvidenceStore(db);
  });

  afterEach(() => {
    db.close();
  });

  it('should save and retrieve an evidence item', async () => {
    const evidence: EvidenceItem = {
      evidenceId: 'evidence-1',
      type: 'speaking',
      userId: 'user-1',
      lessonId: 'lesson-1',
      source: 'system',
      referenceIds: ['ref-1'],
      createdAt: new Date().toISOString(),
    };

    await store.save(evidence);
    const retrieved = await store.findById('evidence-1');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.evidenceId).toBe('evidence-1');
    expect(retrieved?.type).toBe('speaking');
  });

  it('should find evidence by user ID', async () => {
    const evidence1: EvidenceItem = {
      evidenceId: 'evidence-1',
      type: 'speaking',
      userId: 'user-1',
      source: 'system',
      referenceIds: [],
      createdAt: new Date().toISOString(),
    };
    const evidence2: EvidenceItem = {
      evidenceId: 'evidence-2',
      type: 'writing',
      userId: 'user-1',
      source: 'system',
      referenceIds: [],
      createdAt: new Date().toISOString(),
    };

    await store.save(evidence1);
    await store.save(evidence2);

    const found = await store.findByUserId('user-1');
    expect(found.length).toBeGreaterThanOrEqual(2);
  });

  it('should update evidence status', async () => {
    const evidence: EvidenceItem = {
      evidenceId: 'evidence-1',
      type: 'speaking',
      userId: 'user-1',
      source: 'system',
      referenceIds: [],
      createdAt: new Date().toISOString(),
    };

    await store.save(evidence);
    await store.updateStatus('evidence-1', EvidenceStatus.VALIDATED, 'corr-1');

    const found = await store.findByStatus(EvidenceStatus.VALIDATED);
    expect(found.length).toBeGreaterThanOrEqual(1);
  });
});
