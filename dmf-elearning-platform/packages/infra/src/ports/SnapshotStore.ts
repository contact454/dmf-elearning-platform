/**
 * Snapshot Store Port Interface
 * 
 * Phase 2 Sprint 1: SQLite Persistence (Opt-in)
 * 
 * Defines the contract for storing and retrieving read model snapshots.
 * Implementations can be in-memory (default) or SQLite (opt-in).
 */

/**
 * Snapshot record
 */
export type Snapshot = {
  /**
   * Unique snapshot ID
   */
  snapshotId: string;

  /**
   * Read model name (e.g., 'dashboard', 'lesson-progress')
   */
  modelName: string;

  /**
   * Model key (e.g., userId, lessonId, or composite key)
   */
  modelKey: string;

  /**
   * Snapshot data (serialized read model state)
   */
  snapshot: unknown;

  /**
   * Event ID that triggered this snapshot
   */
  eventId: string;

  /**
   * Timestamp when snapshot was created
   */
  createdAt: string;

  /**
   * Correlation ID for tracing
   */
  correlationId?: string;
};

/**
 * Snapshot Store interface
 */
export interface SnapshotStore {
  /**
   * Save a snapshot
   */
  save(snapshot: Snapshot): Promise<void>;

  /**
   * Find latest snapshot for a model and key
   */
  findLatest(modelName: string, modelKey: string): Promise<Snapshot | null>;

  /**
   * Find snapshot by ID
   */
  findById(snapshotId: string): Promise<Snapshot | null>;

  /**
   * Find snapshots by model name
   */
  findByModelName(modelName: string): Promise<Snapshot[]>;

  /**
   * Find snapshots by event ID
   */
  findByEventId(eventId: string): Promise<Snapshot[]>;

  /**
   * Find snapshots before a specific event ID
   */
  findBeforeEventId(modelName: string, modelKey: string, eventId: string): Promise<Snapshot | null>;
}
