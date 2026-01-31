/**
 * SQLite Evidence Store adapter
 * 
 * Phase 2 Sprint 1: SQLite Persistence (Opt-in)
 * 
 * Implements EvidenceStore interface using SQLite.
 */

import Database from 'better-sqlite3';
import type { EvidenceStore } from '../ports/EvidenceStore.js';
import type { EvidenceItem, EvidenceStatus } from '@dmf/evidence';

export class SqliteEvidenceStore implements EvidenceStore {
  constructor(private db: Database.Database) {
    // Ensure table exists (migration should handle this, but defensive check)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS evidence_items (
        id TEXT PRIMARY KEY,
        correlationId TEXT NOT NULL,
        status TEXT NOT NULL,
        payload TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_evidence_items_correlation_id ON evidence_items(correlationId);
      CREATE INDEX IF NOT EXISTS idx_evidence_items_status ON evidence_items(status);
      CREATE INDEX IF NOT EXISTS idx_evidence_items_created_at ON evidence_items(createdAt);
      CREATE INDEX IF NOT EXISTS idx_evidence_items_updated_at ON evidence_items(updatedAt);
    `);
  }

  async save(evidence: EvidenceItem): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO evidence_items (id, correlationId, status, payload, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const now = Date.now();
    // Default status is CREATED for new evidence
    const existing = await this.findById(evidence.evidenceId);
    const status = existing ? this.getStatus(existing) : 'created';
    
    stmt.run(
      evidence.evidenceId,
      evidence.evidenceId, // Use evidenceId as correlationId if not provided separately
      status,
      JSON.stringify(evidence),
      new Date(evidence.createdAt).getTime(),
      now
    );
  }

  async findById(evidenceId: string): Promise<EvidenceItem | null> {
    const stmt = this.db.prepare('SELECT payload FROM evidence_items WHERE id = ?');
    const result = stmt.get(evidenceId) as { payload: string } | undefined;
    return result ? (JSON.parse(result.payload) as EvidenceItem) : null;
  }

  async findByUserId(userId: string): Promise<EvidenceItem[]> {
    const stmt = this.db.prepare('SELECT payload FROM evidence_items WHERE payload LIKE ?');
    const results = stmt.all(`%"userId":"${userId}"%`) as Array<{ payload: string }>;
    return results.map((r) => JSON.parse(r.payload) as EvidenceItem);
  }

  async findByLessonId(lessonId: string): Promise<EvidenceItem[]> {
    const stmt = this.db.prepare('SELECT payload FROM evidence_items WHERE payload LIKE ?');
    const results = stmt.all(`%"lessonId":"${lessonId}"%`) as Array<{ payload: string }>;
    return results.map((r) => JSON.parse(r.payload) as EvidenceItem);
  }

  async findByCorrelationId(correlationId: string): Promise<EvidenceItem[]> {
    const stmt = this.db.prepare('SELECT payload FROM evidence_items WHERE correlationId = ?');
    const results = stmt.all(correlationId) as Array<{ payload: string }>;
    return results.map((r) => JSON.parse(r.payload) as EvidenceItem);
  }

  async updateStatus(evidenceId: string, status: EvidenceStatus, correlationId: string): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE evidence_items
      SET status = ?, updatedAt = ?, correlationId = ?
      WHERE id = ?
    `);
    
    stmt.run(status, Date.now(), correlationId, evidenceId);
  }

  async findByStatus(status: EvidenceStatus): Promise<EvidenceItem[]> {
    const stmt = this.db.prepare('SELECT payload FROM evidence_items WHERE status = ?');
    const results = stmt.all(status) as Array<{ payload: string }>;
    return results.map((r) => JSON.parse(r.payload) as EvidenceItem);
  }

  private getStatus(_evidence: EvidenceItem): EvidenceStatus {
    // This is a simplified implementation
    // In a real system, status would be tracked separately
    return 'created' as EvidenceStatus;
  }
}
