/**
 * In-memory SkillScore repository. M3.
 */

import type { UserId } from '@dmf/shared';
import { getSkillScore, setSkillScore, listSkillScoresByUser } from './skillscore.store.js';
import type { SkillScore, SkillType } from './models.js';

export interface SkillScoreRepository {
  findByUserIdAndSkill(userId: UserId, skillType: SkillType): Promise<SkillScore | null>;
  findByUserId(userId: UserId): Promise<SkillScore[]>;
  save(s: SkillScore): Promise<void>;
  create(s: SkillScore): Promise<SkillScore>;
}

export function createInMemorySkillScoreRepository(): SkillScoreRepository {
  return {
    async findByUserIdAndSkill(userId: UserId, skillType: SkillType) {
      const s = getSkillScore(userId, skillType);
      return s ?? null;
    },
    async findByUserId(userId: UserId) {
      return listSkillScoresByUser(userId);
    },
    async save(s: SkillScore) {
      setSkillScore(s);
    },
    async create(s: SkillScore) {
      setSkillScore(s);
      return s;
    },
  };
}
