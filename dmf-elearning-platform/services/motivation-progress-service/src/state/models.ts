/**
 * State models (Mô hình Trạng thái)
 *
 * Derived state for motivation-progress-service. M3 Progress & Mastery.
 * scoreVal 0–1 per learning-state-scoring-rules (threshold 0.7, floor 0.6).
 */

import type { UserId, LessonId } from '@dmf/shared';

/** Mastery threshold (ngưỡng thành thạo). Lesson mastered if overallScore >= 0.7. */
export const MASTERY_THRESHOLD = 0.7;
/** Readiness skill floor. All skills >= 0.6 for readiness gate. */
export const READINESS_SKILL_FLOOR = 0.6;

export type SkillType = 'grammar' | 'vocabulary' | 'speaking' | 'listening' | 'reading' | 'writing';

/**
 * MasteryState (Trạng thái Thành thạo)
 */
export interface MasteryState {
  userId: UserId;
  overallScore: number; // 0–1
  lessonMastery: Record<
    LessonId,
    {
      evidenceCount: number;
      lastUpdatedAt: string;
      overallScore: number; // 0–1
    }
  >;
  skillBreakdown: Record<SkillType, number>; // 0–1 per skill
  version: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * SkillScore (Điểm Kỹ năng). scoreVal 0–1.
 */
export interface SkillScore {
  userId: UserId;
  skillType: SkillType;
  scoreVal: number;
  evidenceCount: number;
  lastUpdatedAt: string;
}

function emptySkillBreakdown(): Record<SkillType, number> {
  return {
    grammar: 0,
    vocabulary: 0,
    speaking: 0,
    listening: 0,
    reading: 0,
    writing: 0,
  };
}

export function createEmptyMasteryState(userId: UserId): MasteryState {
  const now = new Date().toISOString();
  return {
    userId,
    overallScore: 0,
    lessonMastery: {},
    skillBreakdown: emptySkillBreakdown(),
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
}
