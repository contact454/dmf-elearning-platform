/**
 * SQLite Audit Store adapter
 * 
 * Phase 2 Sprint 1: SQLite Persistence (Opt-in)
 * 
 * Implements AuditStore interface using SQLite.
 */

import Database from 'better-sqlite3';
import type { AuditStore } from '../ports/AuditStore.js';
import type { AuditRecord, AuditRecordFilter } from '@dmf/ops';

export class SqliteAuditStore implements AuditStore {
  constructor(private db: Database.Database) {
    // Ensure table exists (migration should handle this, but defensive check)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ops_audit_records (
        id TEXT PRIMARY KEY,
        correlationId TEXT NOT NULL,
        actorType TEXT NOT NULL,
        actorUserId TEXT,
        record TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_audit_records_correlation_id ON ops_audit_records(correlationId);
      CREATE INDEX IF NOT EXISTS idx_audit_records_actor_user_id ON ops_audit_records(actorUserId);
      CREATE INDEX IF NOT EXISTS idx_audit_records_created_at ON ops_audit_records(createdAt);
      CREATE INDEX IF NOT EXISTS idx_audit_records_actor_type ON ops_audit_records(actorType);
    `);
  }

  async save(record: AuditRecord): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO ops_audit_records (id, correlationId, actorType, actorUserId, record, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const createdAt = new Date(record.timestamp).getTime();
    stmt.run(
      record.auditId,
      record.correlationId,
      record.actorType,
      record.actorUserId || null,
      JSON.stringify(record),
      createdAt
    );
  }

  async find(filter: AuditRecordFilter): Promise<AuditRecord[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filter.actorType) {
      conditions.push('actorType = ?');
      params.push(filter.actorType);
    }
    if (filter.actorUserId) {
      conditions.push('actorUserId = ?');
      params.push(filter.actorUserId);
    }
    if (filter.correlationId) {
      conditions.push('correlationId = ?');
      params.push(filter.correlationId);
    }
    if (filter.fromTimestamp) {
      conditions.push('createdAt >= ?');
      params.push(new Date(filter.fromTimestamp).getTime());
    }
    if (filter.toTimestamp) {
      conditions.push('createdAt <= ?');
      params.push(new Date(filter.toTimestamp).getTime());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const stmt = this.db.prepare(`SELECT record FROM ops_audit_records ${whereClause}`);
    const results = stmt.all(...params) as Array<{ record: string }>;
    const records = results.map((r) => JSON.parse(r.record) as AuditRecord);

    // Apply remaining filters that require JSON parsing
    return records.filter((record) => {
      if (filter.action && record.action !== filter.action) return false;
      if (filter.resourceType && record.resourceType !== filter.resourceType) return false;
      if (filter.resourceId && record.resourceId !== filter.resourceId) return false;
      if (filter.eventName && record.eventName !== filter.eventName) return false;
      return true;
    });
  }

  async findById(auditId: string): Promise<AuditRecord | null> {
    const stmt = this.db.prepare('SELECT record FROM ops_audit_records WHERE id = ?');
    const result = stmt.get(auditId) as { record: string } | undefined;
    return result ? (JSON.parse(result.record) as AuditRecord) : null;
  }

  async findByCorrelationId(correlationId: string): Promise<AuditRecord[]> {
    const stmt = this.db.prepare('SELECT record FROM ops_audit_records WHERE correlationId = ?');
    const results = stmt.all(correlationId) as Array<{ record: string }>;
    return results.map((r) => JSON.parse(r.record) as AuditRecord);
  }

  async findByActorUserId(actorUserId: string): Promise<AuditRecord[]> {
    const stmt = this.db.prepare('SELECT record FROM ops_audit_records WHERE actorUserId = ?');
    const results = stmt.all(actorUserId) as Array<{ record: string }>;
    return results.map((r) => JSON.parse(r.record) as AuditRecord);
  }

  async findByEventName(eventName: string): Promise<AuditRecord[]> {
    const stmt = this.db.prepare('SELECT record FROM ops_audit_records WHERE record LIKE ?');
    const results = stmt.all(`%"eventName":"${eventName}"%`) as Array<{ record: string }>;
    return results.map((r) => JSON.parse(r.record) as AuditRecord);
  }
}
