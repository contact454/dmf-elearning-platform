/**
 * In-memory MasteryState repository. M3.
 */

import type { UserId } from '@dmf/shared';
import { getMasteryState, setMasteryState } from './mastery.store.js';
import { createEmptyMasteryState, type MasteryState } from './models.js';

export interface MasteryStateRepository {
  findByUserId(userId: UserId): Promise<MasteryState | null>;
  getOrCreate(userId: UserId): Promise<MasteryState>;
  save(state: MasteryState): Promise<void>;
  create(state: MasteryState): Promise<MasteryState>;
}

export function createInMemoryMasteryRepository(): MasteryStateRepository {
  return {
    async findByUserId(userId: UserId) {
      const s = getMasteryState(userId);
      return s ?? null;
    },
    async getOrCreate(userId: UserId) {
      const s = getMasteryState(userId);
      if (s) return s;
      const init = createEmptyMasteryState(userId);
      setMasteryState(init);
      return init;
    },
    async save(state: MasteryState) {
      setMasteryState(state);
    },
    async create(state: MasteryState) {
      setMasteryState(state);
      return state;
    },
  };
}
