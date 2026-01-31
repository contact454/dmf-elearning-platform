/**
 * Attempt Repository (Kho lưu trữ Attempt)
 *
 * Uses a singleton Map store (attempt.store.ts) as the ONLY source of truth.
 * No Database dependency - all operations read/write directly to the store.
 */

import type { AttemptId, UserId, LessonId } from '@dmf/shared';
import { AttemptStatus } from '@dmf/shared';
import { getAttemptStore } from './attempt.store';

export interface Attempt {
  id: AttemptId;
  userId: UserId;
  lessonId: LessonId;
  status: AttemptStatus;
  startedAt: Date;
  completedAt?: Date;
  abandonedAt?: Date;
}

export class AttemptRepository {
  constructor() {
    // Singleton repository - no db needed, uses attemptStore directly
    // Instance ID tracking is handled by composition root
  }

  async create(data: {
    userId: UserId;
    lessonId: LessonId;
    status: AttemptStatus;
    startedAt: Date;
  }): Promise<Attempt> {
    const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as any;
    const attempt: Attempt = {
      id: attemptId,
      ...data,
    };

    // Source of truth: singleton store ONLY
    const store = getAttemptStore();
    store.set(attempt.id as any, attempt);
    return attempt;
  }

  async findById(id: AttemptId): Promise<Attempt | null> {
    const store = getAttemptStore();
    const found = store.get(id as any);
    return (found as Attempt | undefined) ?? null;
  }

  async findByUserAndLesson(userId: UserId, lessonId: LessonId): Promise<Attempt[]> {
    const store = getAttemptStore();
    return Array.from(store.values()).filter((a) => a.userId === userId && a.lessonId === lessonId);
  }

  async update(
    id: AttemptId,
    data: Partial<Pick<Attempt, 'status' | 'completedAt' | 'abandonedAt'>>
  ): Promise<Attempt> {
    const store = getAttemptStore();
    const existing = store.get(id as any);

    if (!existing) {
      throw new Error('Attempt not found');
    }

    // CRITICAL: Always use the id parameter as key, never use existing.id or existing.attemptId
    // This ensures we don't accidentally change the key or lose the attempt
    const updated: Attempt = {
      ...existing,
      ...data,
      id: id, // Ensure id field matches the key parameter
    };

    // Set using the id parameter (guaranteed to be the correct key)
    store.set(id as any, updated);
    return updated;
  }
}
