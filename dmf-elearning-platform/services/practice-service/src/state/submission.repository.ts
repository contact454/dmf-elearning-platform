/**
 * Submission Repository (Kho lưu trữ Submission)
 *
 * Uses a singleton Map store (submission.store.ts) as the ONLY source of truth.
 * Database adapter may be used for best-effort sync but store is authoritative.
 */

import type { SubmissionId, AttemptId, ActivityId } from '@dmf/shared';
import type { Database } from '@dmf/infra';
import { getSubmissionStore } from './submission.store';

export interface Submission {
  id: SubmissionId;
  attemptId: AttemptId;
  activityId: ActivityId;
  type: 'quiz' | 'listening' | 'speaking' | 'writing';
  answer?: string;
  audioUrl?: string;
  createdAt: Date;
}

export class SubmissionRepository {
  constructor(private db: Database) {
    // Repository uses store as source of truth, db is optional for best-effort sync
  }

  async create(data: Submission): Promise<Submission> {
    // Source of truth: singleton store ONLY
    const store = getSubmissionStore();
    store.set(data.id as any, data);
    
    // Best-effort DB sync (non-blocking, may fail silently in dev/E2E)
    try {
      await this.db.query('INSERT INTO submissions VALUES ?', [data]);
    } catch {
      // Ignore DB errors in dev/E2E mode
    }
    
    return data;
  }

  async findById(id: SubmissionId): Promise<Submission | null> {
    // Source of truth: singleton store FIRST
    const store = getSubmissionStore();
    const found = store.get(id as any);
    if (found) {
      return found;
    }
    
    // Fallback to DB (should not happen if store is source of truth)
    try {
      const results = await this.db.query<Submission>('SELECT * FROM submissions WHERE id = ?', [id]);
      if (results[0]) {
        // Sync back to store
        store.set(id as any, results[0]);
        return results[0];
      }
    } catch {
      // Ignore DB errors
    }
    
    return null;
  }

  /**
   * Find submissions by attemptId (for querying all submissions in an attempt)
   */
  async findByAttemptId(attemptId: AttemptId): Promise<Submission[]> {
    const store = getSubmissionStore();
    return Array.from(store.values()).filter((s) => s.attemptId === attemptId);
  }

  /**
   * Find submission by attemptId + activityId (natural key)
   */
  async findByAttemptAndActivity(attemptId: AttemptId, activityId: ActivityId): Promise<Submission | null> {
    const store = getSubmissionStore();
    const found = Array.from(store.values()).find(
      (s) => s.attemptId === attemptId && s.activityId === activityId
    );
    return found || null;
  }
}
