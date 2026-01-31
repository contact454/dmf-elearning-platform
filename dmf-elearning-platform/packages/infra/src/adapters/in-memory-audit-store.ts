/**
 * In-Memory Audit Store
 * 
 * Phase 2 Sprint 1: SQLite Persistence (Opt-in)
 * 
 * Default in-memory implementation (used when DMF_PERSISTENCE != 'sqlite').
 */

import type { AuditRecord, AuditRecordFilter } from '@dmf/ops';
import { filterAuditRecords } from '@dmf/ops';
import type { AuditStore } from '../ports/AuditStore.js';

export class InMemoryAuditStore implements AuditStore {
  private records = new Map<string, AuditRecord>();

  async save(record: AuditRecord): Promise<void> {
    this.records.set(record.auditId, record);
  }

  async find(filter: AuditRecordFilter): Promise<AuditRecord[]> {
    return filterAuditRecords(Array.from(this.records.values()), filter);
  }

  async findById(auditId: string): Promise<AuditRecord | null> {
    return this.records.get(auditId) || null;
  }

  async findByCorrelationId(correlationId: string): Promise<AuditRecord[]> {
    return Array.from(this.records.values()).filter((r) => r.correlationId === correlationId);
  }

  async findByActorUserId(actorUserId: string): Promise<AuditRecord[]> {
    return Array.from(this.records.values()).filter((r) => r.actorUserId === actorUserId);
  }

  async findByEventName(eventName: string): Promise<AuditRecord[]> {
    return Array.from(this.records.values()).filter((r) => r.eventName === eventName);
  }
}
