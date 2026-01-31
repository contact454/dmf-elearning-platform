/**
 * In-memory MasteryState store (Map userId → MasteryState).
 * M3 Progress & Mastery. scoreVal 0–1 per docs.
 */

import type { UserId } from '@dmf/shared';
import type { MasteryState } from './models.js';

const store = new Map<UserId, MasteryState>();

export function getMasteryState(userId: UserId): MasteryState | undefined {
  return store.get(userId);
}

export function setMasteryState(state: MasteryState): void {
  store.set(state.userId, state);
}

export function clearMasteryStore(): void {
  store.clear();
}
