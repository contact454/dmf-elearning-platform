/**
 * Readiness Model (Mô hình Sẵn sàng)
 * 
 * Pure function to compute ReadinessState from MasteryState and Assessment results.
 * No IO, deterministic, stateless.
 */

import type { UserId, AssessmentId } from '@dmf/shared';

/**
 * MasteryState input (Đầu vào MasteryState)
 * 
 * Read-only structure matching MasteryState from motivation-progress-service.
 */
export interface MasteryStateInput {
  userId: UserId;
  overallScore: number; // 0-100
  skillBreakdown: {
    grammar: number;
    vocabulary: number;
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
  };
  version: number;
}

/**
 * Assessment input (Đầu vào Assessment)
 * 
 * Read-only structure matching Assessment from assessment-service.
 */
export interface AssessmentInput {
  id: AssessmentId;
  userId: UserId;
  score?: number; // 0-100, optional
  status: string;
}

/**
 * ReadinessState (Trạng thái Sẵn sàng)
 * 
 * Computed readiness status for learner.
 */
export interface ReadinessState {
  userId: UserId;
  computedAt: string; // ISO 8601
  readiness: {
    overall: 'ready' | 'not_ready' | 'unknown';
    perSkill: {
      grammar: 'ready' | 'not_ready' | 'unknown';
      vocabulary: 'ready' | 'not_ready' | 'unknown';
      speaking: 'ready' | 'not_ready' | 'unknown';
      listening: 'ready' | 'not_ready' | 'unknown';
      reading: 'ready' | 'not_ready' | 'unknown';
      writing: 'ready' | 'not_ready' | 'unknown';
    };
    blockers: string[]; // Human-readable reasons blocking readiness
  };
  sourceRefs?: {
    assessmentId?: AssessmentId;
    masteryVersion?: number;
  };
}

/**
 * Compute ReadinessState (Tính toán ReadinessState)
 * 
 * Pure function: computes readiness from MasteryState and optional Assessment.
 * Deterministic, no IO, stateless.
 * 
 * @param userId - User ID (required) / ID người dùng (bắt buộc)
 * @param masteryState - MasteryState from motivation-progress-service
 * @param assessment - Optional latest Assessment from assessment-service
 * @returns ReadinessState
 */
export function computeReadiness(
  userId: UserId,
  masteryState: MasteryStateInput | null,
  assessment: AssessmentInput | null = null
): ReadinessState {
  const computedAt = new Date().toISOString();

  // If no mastery state, return unknown (Nếu không có trạng thái thành thạo, trả về unknown)
  if (!masteryState) {
    return {
      userId,
      computedAt,
      readiness: {
        overall: 'unknown',
        perSkill: {
          grammar: 'unknown',
          vocabulary: 'unknown',
          speaking: 'unknown',
          listening: 'unknown',
          reading: 'unknown',
          writing: 'unknown',
        },
        blockers: ['No mastery data available'],
      },
      sourceRefs: {
        assessmentId: assessment?.id,
      },
    };
  }

  // Compute per-skill readiness (placeholder, deterministic) (Tính toán sẵn sàng theo kỹ năng - placeholder, xác định)
  const skillThreshold = 70; // Threshold for "ready" (Ngưỡng cho "sẵn sàng")
  const perSkill: ReadinessState['readiness']['perSkill'] = {
    grammar: masteryState.skillBreakdown.grammar >= skillThreshold ? 'ready' : 'not_ready',
    vocabulary: masteryState.skillBreakdown.vocabulary >= skillThreshold ? 'ready' : 'not_ready',
    speaking: masteryState.skillBreakdown.speaking >= skillThreshold ? 'ready' : 'not_ready',
    listening: masteryState.skillBreakdown.listening >= skillThreshold ? 'ready' : 'not_ready',
    reading: masteryState.skillBreakdown.reading >= skillThreshold ? 'ready' : 'not_ready',
    writing: masteryState.skillBreakdown.writing >= skillThreshold ? 'ready' : 'not_ready',
  };

  // Collect blockers (Thu thập các yếu tố chặn)
  const blockers: string[] = [];
  if (masteryState.skillBreakdown.grammar < skillThreshold) {
    blockers.push('Grammar skill below threshold');
  }
  if (masteryState.skillBreakdown.vocabulary < skillThreshold) {
    blockers.push('Vocabulary skill below threshold');
  }
  if (masteryState.skillBreakdown.speaking < skillThreshold) {
    blockers.push('Speaking skill below threshold');
  }
  if (masteryState.skillBreakdown.listening < skillThreshold) {
    blockers.push('Listening skill below threshold');
  }
  if (masteryState.skillBreakdown.reading < skillThreshold) {
    blockers.push('Reading skill below threshold');
  }
  if (masteryState.skillBreakdown.writing < skillThreshold) {
    blockers.push('Writing skill below threshold');
  }

  // Compute overall readiness (Tính toán sẵn sàng tổng thể)
  const readyCount = Object.values(perSkill).filter((s) => s === 'ready').length;
  const overall: 'ready' | 'not_ready' | 'unknown' =
    readyCount === 6 ? 'ready' : readyCount === 0 ? 'unknown' : 'not_ready';

  // If assessment score is high, may override blockers (Nếu điểm assessment cao, có thể ghi đè blockers)
  if (assessment?.score && assessment.score >= 80) {
    // High assessment score indicates readiness despite skill breakdown (Điểm assessment cao cho thấy sẵn sàng bất chấp phân tích kỹ năng)
    if (blockers.length > 0 && blockers.length <= 2) {
      blockers.length = 0; // Clear blockers if assessment score is high (Xóa blockers nếu điểm assessment cao)
    }
  }

  return {
    userId: masteryState.userId,
    computedAt,
    readiness: {
      overall,
      perSkill,
      blockers: blockers.length > 0 ? blockers : [],
    },
    sourceRefs: {
      assessmentId: assessment?.id,
      masteryVersion: masteryState.version,
    },
  };
}
