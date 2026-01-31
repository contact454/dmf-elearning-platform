/**
 * Evidence Registry (Đăng ký Bằng chứng)
 * 
 * In-memory, append-only evidence store.
 * Versionable by userId for future queries.
 */

import type { EvidenceItem, EvidenceSummary } from './evidence.types.js';

class EvidenceRegistry {
  private evidence = new Map<string, EvidenceItem>(); // evidenceId -> EvidenceItem
  private userIndex = new Map<string, string[]>(); // userId -> evidenceId[]
  private lessonIndex = new Map<string, string[]>(); // userId:lessonId -> evidenceId[]

  /**
   * Add evidence (append-only)
   */
  addEvidence(item: EvidenceItem): void {
    // Check if already exists (idempotency)
    if (this.evidence.has(item.evidenceId)) {
      return;
    }

    // Store evidence
    this.evidence.set(item.evidenceId, item);

    // Update user index
    const userEvidence = this.userIndex.get(item.userId) || [];
    userEvidence.push(item.evidenceId);
    this.userIndex.set(item.userId, userEvidence);

    // Update lesson index (if lessonId exists)
    if (item.lessonId) {
      const lessonKey = `${item.userId}:${item.lessonId}`;
      const lessonEvidence = this.lessonIndex.get(lessonKey) || [];
      lessonEvidence.push(item.evidenceId);
      this.lessonIndex.set(lessonKey, lessonEvidence);
    }
  }

  /**
   * Get evidence by ID
   */
  getEvidenceById(evidenceId: string): EvidenceItem | null {
    return this.evidence.get(evidenceId) || null;
  }

  /**
   * Get all evidence for a user
   */
  getEvidenceByUser(userId: string): EvidenceItem[] {
    const evidenceIds = this.userIndex.get(userId) || [];
    return evidenceIds
      .map((id) => this.evidence.get(id))
      .filter((item): item is EvidenceItem => item !== undefined);
  }

  /**
   * Get evidence for a user and lesson
   */
  getEvidenceByLesson(userId: string, lessonId: string): EvidenceItem[] {
    const lessonKey = `${userId}:${lessonId}`;
    const evidenceIds = this.lessonIndex.get(lessonKey) || [];
    return evidenceIds
      .map((id) => this.evidence.get(id))
      .filter((item): item is EvidenceItem => item !== undefined);
  }

  /**
   * Get evidence summary for user/lesson
   */
  getEvidenceSummary(userId: string, lessonId?: string): EvidenceSummary {
    const items = lessonId
      ? this.getEvidenceByLesson(userId, lessonId)
      : this.getEvidenceByUser(userId);

    const counts = {
      attendance: 0,
      speaking: 0,
      writing: 0,
      activity_submission: 0,
      teacher_validation: 0,
      mentor_validation: 0,
    };

    let lastEvidenceAt: string | undefined;

    for (const item of items) {
      counts[item.type] = (counts[item.type] || 0) + 1;
      if (!lastEvidenceAt || item.createdAt > lastEvidenceAt) {
        lastEvidenceAt = item.createdAt;
      }
    }

    return {
      userId,
      lessonId,
      courseId: items[0]?.courseId,
      evidenceCounts: counts,
      totalEvidence: items.length,
      lastEvidenceAt,
    };
  }

  /**
   * Get all evidence (for admin/debugging)
   */
  getAllEvidence(): EvidenceItem[] {
    return Array.from(this.evidence.values());
  }
}

// Singleton instance
let registryInstance: EvidenceRegistry | null = null;

export function getEvidenceRegistry(): EvidenceRegistry {
  if (!registryInstance) {
    registryInstance = new EvidenceRegistry();
  }
  return registryInstance;
}
