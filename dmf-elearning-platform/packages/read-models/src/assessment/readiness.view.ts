/**
 * Assessment Readiness View Read Model
 * 
 * Aggregated view of user's readiness for assessment.
 * Combines data from motivation-progress-service, assessment-service, and lesson completion.
 */

import type { UserId } from '@dmf/shared';

export type ReadinessLevel = 'ready' | 'not_ready' | 'almost_ready' | 'unknown';

export interface SkillReadiness {
  skill: 'grammar' | 'vocabulary' | 'speaking' | 'listening' | 'reading' | 'writing';
  level: ReadinessLevel;
  score?: number; // 0-100
  completedLessons: number;
  requiredLessons: number;
}

export interface AssessmentReadinessView {
  userId: UserId;
  overall: ReadinessLevel;
  skillBreakdown: SkillReadiness[];
  completedLessonsCount: number;
  totalLessonsCount: number;
  lastAssessmentAt?: string; // ISO timestamp
  lastUpdatedAt: string; // ISO timestamp
}

/**
 * Create empty readiness view for a user
 */
export function createEmptyReadinessView(userId: UserId): AssessmentReadinessView {
  return {
    userId,
    overall: 'unknown',
    skillBreakdown: [
      { skill: 'grammar', level: 'unknown', completedLessons: 0, requiredLessons: 0 },
      { skill: 'vocabulary', level: 'unknown', completedLessons: 0, requiredLessons: 0 },
      { skill: 'speaking', level: 'unknown', completedLessons: 0, requiredLessons: 0 },
      { skill: 'listening', level: 'unknown', completedLessons: 0, requiredLessons: 0 },
      { skill: 'reading', level: 'unknown', completedLessons: 0, requiredLessons: 0 },
      { skill: 'writing', level: 'unknown', completedLessons: 0, requiredLessons: 0 },
    ],
    completedLessonsCount: 0,
    totalLessonsCount: 0,
    lastAssessmentAt: undefined,
    lastUpdatedAt: new Date().toISOString(),
  };
}
