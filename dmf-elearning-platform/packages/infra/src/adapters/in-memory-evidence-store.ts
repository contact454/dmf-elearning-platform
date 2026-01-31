/**
 * In-Memory Evidence Store
 * 
 * Phase 2 Sprint 1: SQLite Persistence (Opt-in)
 * 
 * Default in-memory implementation (used when DMF_PERSISTENCE != 'sqlite').
 */

import type { EvidenceStore } from '../ports/EvidenceStore.js';
import { EvidenceStatus, type EvidenceItem } from '@dmf/evidence';

export class InMemoryEvidenceStore implements EvidenceStore {
  private evidence = new Map<string, EvidenceItem>();
  private statusMap = new Map<string, EvidenceStatus>();

  async save(evidence: EvidenceItem): Promise<void> {
    this.evidence.set(evidence.evidenceId, evidence);
    if (!this.statusMap.has(evidence.evidenceId)) {
      this.statusMap.set(evidence.evidenceId, EvidenceStatus.CREATED);
    }
  }

  async findById(evidenceId: string): Promise<EvidenceItem | null> {
    return this.evidence.get(evidenceId) || null;
  }

  async findByUserId(userId: string): Promise<EvidenceItem[]> {
    return Array.from(this.evidence.values()).filter((e) => e.userId === userId);
  }

  async findByLessonId(lessonId: string): Promise<EvidenceItem[]> {
    return Array.from(this.evidence.values()).filter((e) => e.lessonId === lessonId);
  }

  async findByCorrelationId(correlationId: string): Promise<EvidenceItem[]> {
    // Simplified: use evidenceId as correlationId
    return Array.from(this.evidence.values()).filter((e) => e.evidenceId === correlationId);
  }

  async updateStatus(evidenceId: string, status: EvidenceStatus, _correlationId: string): Promise<void> {
    this.statusMap.set(evidenceId, status);
  }

  async findByStatus(status: EvidenceStatus): Promise<EvidenceItem[]> {
    return Array.from(this.evidence.values()).filter((e) => {
      return this.statusMap.get(e.evidenceId) === status;
    });
  }
}
