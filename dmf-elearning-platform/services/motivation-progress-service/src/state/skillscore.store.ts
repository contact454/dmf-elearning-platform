/**
 * In-memory SkillScore store. Key: `${userId}:${skillType}`.
 * M3. scoreVal 0–1 per learning-state-scoring-rules.
 */

import type { UserId } from '@dmf/shared';
import type { SkillScore } from './models.js';

const store = new Map<string, SkillScore>();

function key(userId: UserId, skillType: SkillScore['skillType']): string {
  return `${userId}:${skillType}`;
}

export function getSkillScore(userId: UserId, skillType: SkillScore['skillType']): SkillScore | undefined {
  return store.get(key(userId, skillType));
}

export function setSkillScore(s: SkillScore): void {
  store.set(key(s.userId, s.skillType), s);
}

export function listSkillScoresByUser(userId: UserId): SkillScore[] {
  const out: SkillScore[] = [];
  for (const v of store.values()) {
    if (v.userId === userId) out.push(v);
  }
  return out;
}

export function clearSkillScoreStore(): void {
  store.clear();
}
