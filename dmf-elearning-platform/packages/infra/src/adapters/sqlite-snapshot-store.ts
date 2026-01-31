/**
 * SQLite Snapshot Store adapter
 * 
 * Phase 2 Sprint 1: SQLite Persistence (Opt-in)
 * 
 * Implements SnapshotStore interface using SQLite.
 */

import Database from 'better-sqlite3';
import type { SnapshotStore, Snapshot } from '../ports/SnapshotStore.js';

export class SqliteSnapshotStore implements SnapshotStore {
  constructor(private db: Database.Database) {
    // Ensure table exists (migration should handle this, but defensive check)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS readmodel_snapshots (
        id TEXT PRIMARY KEY,
        modelName TEXT NOT NULL,
        modelKey TEXT NOT NULL,
        snapshot TEXT NOT NULL,
        eventId TEXT NOT NULL,
        correlationId TEXT,
        createdAt INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_snapshots_model_name_key ON readmodel_snapshots(modelName, modelKey);
      CREATE INDEX IF NOT EXISTS idx_snapshots_event_id ON readmodel_snapshots(eventId);
      CREATE INDEX IF NOT EXISTS idx_snapshots_created_at ON readmodel_snapshots(createdAt);
      CREATE INDEX IF NOT EXISTS idx_snapshots_correlation_id ON readmodel_snapshots(correlationId);
    `);
  }

  async save(snapshot: Snapshot): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO readmodel_snapshots (id, modelName, modelKey, snapshot, eventId, correlationId, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const createdAt = new Date(snapshot.createdAt).getTime();
    stmt.run(
      snapshot.snapshotId,
      snapshot.modelName,
      snapshot.modelKey,
      JSON.stringify(snapshot.snapshot),
      snapshot.eventId,
      snapshot.correlationId || null,
      createdAt
    );
  }

  async findLatest(modelName: string, modelKey: string): Promise<Snapshot | null> {
    const stmt = this.db.prepare(`
      SELECT id, modelName, modelKey, snapshot, eventId, correlationId, createdAt
      FROM readmodel_snapshots
      WHERE modelName = ? AND modelKey = ?
      ORDER BY createdAt DESC
      LIMIT 1
    `);
    
    const result = stmt.get(modelName, modelKey) as {
      id: string;
      modelName: string;
      modelKey: string;
      snapshot: string;
      eventId: string;
      correlationId: string | null;
      createdAt: number;
    } | undefined;
    
    if (!result) {
      return null;
    }
    
    return {
      snapshotId: result.id,
      modelName: result.modelName,
      modelKey: result.modelKey,
      snapshot: JSON.parse(result.snapshot),
      eventId: result.eventId,
      correlationId: result.correlationId || undefined,
      createdAt: new Date(result.createdAt).toISOString(),
    };
  }

  async findById(snapshotId: string): Promise<Snapshot | null> {
    const stmt = this.db.prepare(`
      SELECT id, modelName, modelKey, snapshot, eventId, correlationId, createdAt
      FROM readmodel_snapshots
      WHERE id = ?
    `);
    
    const result = stmt.get(snapshotId) as {
      id: string;
      modelName: string;
      modelKey: string;
      snapshot: string;
      eventId: string;
      correlationId: string | null;
      createdAt: number;
    } | undefined;
    
    if (!result) {
      return null;
    }
    
    return {
      snapshotId: result.id,
      modelName: result.modelName,
      modelKey: result.modelKey,
      snapshot: JSON.parse(result.snapshot),
      eventId: result.eventId,
      correlationId: result.correlationId || undefined,
      createdAt: new Date(result.createdAt).toISOString(),
    };
  }

  async findByModelName(modelName: string): Promise<Snapshot[]> {
    const stmt = this.db.prepare(`
      SELECT id, modelName, modelKey, snapshot, eventId, correlationId, createdAt
      FROM readmodel_snapshots
      WHERE modelName = ?
      ORDER BY createdAt DESC
    `);
    
    const results = stmt.all(modelName) as Array<{
      id: string;
      modelName: string;
      modelKey: string;
      snapshot: string;
      eventId: string;
      correlationId: string | null;
      createdAt: number;
    }>;
    
    return results.map((r) => ({
      snapshotId: r.id,
      modelName: r.modelName,
      modelKey: r.modelKey,
      snapshot: JSON.parse(r.snapshot),
      eventId: r.eventId,
      correlationId: r.correlationId || undefined,
      createdAt: new Date(r.createdAt).toISOString(),
    }));
  }

  async findByEventId(eventId: string): Promise<Snapshot[]> {
    const stmt = this.db.prepare(`
      SELECT id, modelName, modelKey, snapshot, eventId, correlationId, createdAt
      FROM readmodel_snapshots
      WHERE eventId = ?
      ORDER BY createdAt DESC
    `);
    
    const results = stmt.all(eventId) as Array<{
      id: string;
      modelName: string;
      modelKey: string;
      snapshot: string;
      eventId: string;
      correlationId: string | null;
      createdAt: number;
    }>;
    
    return results.map((r) => ({
      snapshotId: r.id,
      modelName: r.modelName,
      modelKey: r.modelKey,
      snapshot: JSON.parse(r.snapshot),
      eventId: r.eventId,
      correlationId: r.correlationId || undefined,
      createdAt: new Date(r.createdAt).toISOString(),
    }));
  }

  async findBeforeEventId(modelName: string, modelKey: string, eventId: string): Promise<Snapshot | null> {
    // First, get the createdAt of the event
    const eventStmt = this.db.prepare(`
      SELECT createdAt FROM readmodel_snapshots
      WHERE eventId = ?
      LIMIT 1
    `);
    const eventResult = eventStmt.get(eventId) as { createdAt: number } | undefined;
    
    if (!eventResult) {
      // Event not found, return latest snapshot
      return this.findLatest(modelName, modelKey);
    }
    
    const stmt = this.db.prepare(`
      SELECT id, modelName, modelKey, snapshot, eventId, correlationId, createdAt
      FROM readmodel_snapshots
      WHERE modelName = ? AND modelKey = ? AND createdAt < ?
      ORDER BY createdAt DESC
      LIMIT 1
    `);
    
    const result = stmt.get(modelName, modelKey, eventResult.createdAt) as {
      id: string;
      modelName: string;
      modelKey: string;
      snapshot: string;
      eventId: string;
      correlationId: string | null;
      createdAt: number;
    } | undefined;
    
    if (!result) {
      return null;
    }
    
    return {
      snapshotId: result.id,
      modelName: result.modelName,
      modelKey: result.modelKey,
      snapshot: JSON.parse(result.snapshot),
      eventId: result.eventId,
      correlationId: result.correlationId || undefined,
      createdAt: new Date(result.createdAt).toISOString(),
    };
  }
}
