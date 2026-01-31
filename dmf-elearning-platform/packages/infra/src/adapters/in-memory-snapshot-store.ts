/**
 * In-Memory Snapshot Store
 * 
 * Phase 2 Sprint 1: SQLite Persistence (Opt-in)
 * 
 * Default in-memory implementation (used when DMF_PERSISTENCE != 'sqlite').
 */

import type { SnapshotStore, Snapshot } from '../ports/SnapshotStore.js';

export class InMemorySnapshotStore implements SnapshotStore {
  private snapshots = new Map<string, Snapshot>();

  async save(snapshot: Snapshot): Promise<void> {
    this.snapshots.set(snapshot.snapshotId, snapshot);
  }

  async findLatest(modelName: string, modelKey: string): Promise<Snapshot | null> {
    const matching = Array.from(this.snapshots.values())
      .filter((s) => s.modelName === modelName && s.modelKey === modelKey)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return matching[0] || null;
  }

  async findById(snapshotId: string): Promise<Snapshot | null> {
    return this.snapshots.get(snapshotId) || null;
  }

  async findByModelName(modelName: string): Promise<Snapshot[]> {
    return Array.from(this.snapshots.values())
      .filter((s) => s.modelName === modelName)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findByEventId(eventId: string): Promise<Snapshot[]> {
    return Array.from(this.snapshots.values()).filter((s) => s.eventId === eventId);
  }

  async findBeforeEventId(modelName: string, modelKey: string, eventId: string): Promise<Snapshot | null> {
    const eventSnapshots = Array.from(this.snapshots.values()).filter((s) => s.eventId === eventId);
    if (eventSnapshots.length === 0) {
      return this.findLatest(modelName, modelKey);
    }
    
    const eventTime = new Date(eventSnapshots[0].createdAt).getTime();
    const matching = Array.from(this.snapshots.values())
      .filter((s) => {
        const sTime = new Date(s.createdAt).getTime();
        return s.modelName === modelName && s.modelKey === modelKey && sTime < eventTime;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return matching[0] || null;
  }
}
