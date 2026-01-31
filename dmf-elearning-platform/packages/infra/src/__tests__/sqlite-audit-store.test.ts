/**
 * Unit tests for SQLite Audit Store
 * 
 * Phase 2 Sprint 1: SQLite Persistence (Opt-in)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { SqliteAuditStore } from '../adapters/sqlite-audit-store.js';
import { createAuditRecord, ActorType } from '@dmf/ops';

describe('SqliteAuditStore', () => {
  let db: Database.Database;
  let store: SqliteAuditStore;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    store = new SqliteAuditStore(db);
  });

  afterEach(() => {
    db.close();
  });

  it('should save and retrieve an audit record', async () => {
    const record = createAuditRecord({
      eventName: 'learning.lesson.completed',
      actorType: ActorType.SYSTEM,
      action: 'lesson.complete',
      resourceType: 'lesson',
      resourceId: 'lesson-1',
      correlationId: 'corr-1',
    });

    await store.save(record);
    const retrieved = await store.findById(record.auditId);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.auditId).toBe(record.auditId);
    expect(retrieved?.eventName).toBe('learning.lesson.completed');
  });

  it('should find records by filter', async () => {
    const record1 = createAuditRecord({
      eventName: 'learning.lesson.completed',
      actorType: ActorType.SYSTEM,
      action: 'lesson.complete',
      resourceType: 'lesson',
      resourceId: 'lesson-1',
      correlationId: 'corr-1',
    });
    const record2 = createAuditRecord({
      eventName: 'learning.lesson.started',
      actorType: ActorType.ADMIN,
      actorUserId: 'user-1',
      action: 'lesson.start',
      resourceType: 'lesson',
      resourceId: 'lesson-1',
      correlationId: 'corr-2',
    });

    await store.save(record1);
    await store.save(record2);

    const found = await store.find({ actorType: ActorType.ADMIN });
    expect(found).toHaveLength(1);
    expect(found[0].actorType).toBe(ActorType.ADMIN);
  });

  it('should find records by correlation ID', async () => {
    const record = createAuditRecord({
      eventName: 'learning.lesson.completed',
      actorType: ActorType.SYSTEM,
      action: 'lesson.complete',
      resourceType: 'lesson',
      resourceId: 'lesson-1',
      correlationId: 'corr-1',
    });

    await store.save(record);
    const found = await store.findByCorrelationId('corr-1');

    expect(found).toHaveLength(1);
    expect(found[0].correlationId).toBe('corr-1');
  });
});
