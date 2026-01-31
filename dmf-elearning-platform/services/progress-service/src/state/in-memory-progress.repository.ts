/**
 * In-memory ProgressState repository using progress-state store.
 * Replaces Database-backed repository for M3 (no SQL).
 */

import type { UserId } from '@dmf/shared';
import {
  getProgressState,
  setProgressState,
  listAllProgressStates,
  type ProgressState,
} from './progress-state.store.js';

export type { ProgressState } from './progress-state.store.js';

export interface ProgressStateRepository {
  findByUserId(userId: UserId): Promise<ProgressState | null>;
  getOrCreate(userId: UserId): Promise<ProgressState>;
  create(state: ProgressState): Promise<ProgressState>;
  update(userId: UserId, updates: Partial<ProgressState>): Promise<ProgressState>;
  listAll(): ProgressState[];
}

export function createInMemoryProgressRepository(): ProgressStateRepository {
  return {
    async findByUserId(userId: UserId): Promise<ProgressState | null> {
      const s = getProgressState(userId);
      return s ?? null;
    },

    async getOrCreate(userId: UserId): Promise<ProgressState> {
      const existing = getProgressState(userId);
      if (existing) return existing;

      const now = new Date();
      const initial: ProgressState = {
        userId,
        currentCourseId: undefined,
        completedLessons: [],
        unlockedLessons: [],
        unlockedUnits: [],
        createdAt: now,
        updatedAt: now,
      };
      setProgressState(initial);
      return initial;
    },

    async create(state: ProgressState): Promise<ProgressState> {
      setProgressState(state);
      return state;
    },

    async update(userId: UserId, updates: Partial<ProgressState>): Promise<ProgressState> {
      const existing = getProgressState(userId);
      if (!existing) throw new Error('ProgressState not found');

      const updated: ProgressState = {
        ...existing,
        ...updates,
        updatedAt: new Date(),
      };
      setProgressState(updated);
      return updated;
    },

    listAll(): ProgressState[] {
      return listAllProgressStates();
    },
  };
}
