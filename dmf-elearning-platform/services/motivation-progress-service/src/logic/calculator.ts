import {
  type MasteryState,
  type SkillType,
  MASTERY_THRESHOLD,
  READINESS_SKILL_FLOOR,
} from '../state/models.js';

const CORE_SKILL_WEIGHTS: Record<'listening' | 'reading' | 'speaking' | 'writing', number> = {
  listening: 0.3,
  reading: 0.3,
  speaking: 0.25,
  writing: 0.15,
};

const DECAY_PER_30_DAYS: Record<SkillType, number> = {
  grammar: 0.05,
  vocabulary: 0.05,
  listening: 0.05,
  reading: 0.05,
  speaking: 0.15,
  writing: 0.15,
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function normalizeScore(rawScore: number): number {
  if (rawScore <= 1) return clamp01(rawScore);
  return clamp01(rawScore / 100);
}

function applyTimeDecay(score: number, daysSinceLastUpdate: number, ratePer30Days: number): number {
  if (daysSinceLastUpdate <= 0) return score;
  const periods = daysSinceLastUpdate / 30;
  const decayMultiplier = Math.max(0, 1 - periods * ratePer30Days);
  return clamp01(score * decayMultiplier);
}

export class MasteryCalculator {
  static calculateLessonCompletion(
    currentState: MasteryState,
    lessonId: string,
    rawScore: number
  ): MasteryState {
    const normalizedScore = normalizeScore(rawScore);
    const nowIso = new Date().toISOString();
    const daysSinceLastUpdate = Math.max(
      0,
      (new Date(nowIso).getTime() - new Date(currentState.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    const decayedSkillBreakdown = { ...currentState.skillBreakdown };
    for (const skill of Object.keys(decayedSkillBreakdown) as SkillType[]) {
      decayedSkillBreakdown[skill] = applyTimeDecay(
        decayedSkillBreakdown[skill] ?? 0,
        daysSinceLastUpdate,
        DECAY_PER_30_DAYS[skill]
      );
    }

    for (const [skill, weight] of Object.entries(CORE_SKILL_WEIGHTS) as Array<
      [keyof typeof CORE_SKILL_WEIGHTS, number]
    >) {
      const previous = decayedSkillBreakdown[skill] ?? 0;
      let updated = clamp01(previous * (1 - weight) + normalizedScore * weight);
      if (normalizedScore >= MASTERY_THRESHOLD) {
        updated = Math.max(updated, READINESS_SKILL_FLOOR);
      }
      decayedSkillBreakdown[skill] = updated;
    }

    decayedSkillBreakdown.grammar = clamp01(
      (decayedSkillBreakdown.grammar ?? 0) * 0.8 + normalizedScore * 0.2
    );
    decayedSkillBreakdown.vocabulary = clamp01(
      (decayedSkillBreakdown.vocabulary ?? 0) * 0.75 + normalizedScore * 0.25
    );

    const previousLesson = currentState.lessonMastery[lessonId as keyof typeof currentState.lessonMastery];
    const updatedLessonMastery = {
      ...currentState.lessonMastery,
      [lessonId]: {
        overallScore: normalizedScore,
        evidenceCount: (previousLesson?.evidenceCount ?? 0) + 1,
        lastUpdatedAt: nowIso,
      },
    };

    const skillValues = Object.values(decayedSkillBreakdown);
    const overallScore =
      skillValues.length === 0
        ? 0
        : clamp01(skillValues.reduce((acc, value) => acc + value, 0) / skillValues.length);

    return {
      ...currentState,
      lessonMastery: updatedLessonMastery,
      skillBreakdown: decayedSkillBreakdown,
      overallScore,
      updatedAt: nowIso,
      version: currentState.version + 1,
    };
  }
}
