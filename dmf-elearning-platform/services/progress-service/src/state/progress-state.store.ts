/**
 * In-memory ProgressState store (Map userId → ProgressState).
 * Shared across requests in the same process. Used for M3 Progress & Mastery.
 */

import type { UserId, LessonId, UnitId, CourseId } from '@dmf/shared';

export interface ProgressState {
  userId: UserId;
  currentCourseId?: CourseId;
  completedLessons: LessonId[];
  unlockedLessons: LessonId[];
  unlockedUnits: UnitId[];
  createdAt: Date;
  updatedAt: Date;
}

const store = new Map<UserId, ProgressState>();

export function getProgressStore(): Map<UserId, ProgressState> {
  return store;
}

export function getProgressState(userId: UserId): ProgressState | undefined {
  return store.get(userId);
}

export function setProgressState(state: ProgressState): void {
  store.set(state.userId, state);
}

export function listAllProgressStates(): ProgressState[] {
  return Array.from(store.values());
}

export function clearProgressStore(): void {
  store.clear();
}
