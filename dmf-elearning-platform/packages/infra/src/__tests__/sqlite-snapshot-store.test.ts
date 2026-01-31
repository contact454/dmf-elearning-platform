/**
 * Unit tests for SQLite Snapshot Store
 * 
 * Phase 2 Sprint 1: SQLite Persistence (Opt-in)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { SqliteSnapshotStore } from '../adapters/sqlite-snapshot-store.js';
import type { Snapshot } from '@dmf/read-models';

describe('SqliteSnapshotStore', () => {
  let db: Database.Database;
  let store: SqliteSnapshotStore;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    store = new SqliteSnapshotStore(db);
  });

  afterEach(() => {
    db.close();
  });

  it('should save and retrieve a snapshot', async () => {
    const snapshot: Snapshot = {
      snapshotId: 'snapshot-1',
      modelName: 'dashboard',
      modelKey: 'user-1',
      snapshot: { progress: 50 },
      eventId: 'event-1',
      createdAt: new Date().toISOString(),
    };

    await store.save(snapshot);
    const retrieved = await store.findById('snapshot-1');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.snapshotId).toBe('snapshot-1');
    expect(retrieved?.modelName).toBe('dashboard');
  });

  it('should find latest snapshot for model and key', async () => {
    const snapshot1: Snapshot = {
      snapshotId: 'snapshot-1',
      modelName: 'dashboard',
      modelKey: 'user-1',
      snapshot: { progress: 50 },
      eventId: 'event-1',
      createdAt: new Date('2024-01-01').toISOString(),
    };
    const snapshot2: Snapshot = {
      snapshotId: 'snapshot-2',
      modelName: 'dashboard',
      modelKey: 'user-1',
      snapshot: { progress: 75 },
      eventId: 'event-2',
      createdAt: new Date('2024-01-02').toISOString(),
    };

    await store.save(snapshot1);
    await store.save(snapshot2);

    const latest = await store.findLatest('dashboard', 'user-1');
    expect(latest).not.toBeNull();
    expect(latest?.snapshotId).toBe('snapshot-2');
  });

  it('should find snapshots by model name', async () => {
    const snapshot: Snapshot = {
      snapshotId: 'snapshot-1',
      modelName: 'dashboard',
      modelKey: 'user-1',
      snapshot: { progress: 50 },
      eventId: 'event-1',
      createdAt: new Date().toISOString(),
    };

    await store.save(snapshot);
    const found = await store.findByModelName('dashboard');

    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0].modelName).toBe('dashboard');
  });
});
