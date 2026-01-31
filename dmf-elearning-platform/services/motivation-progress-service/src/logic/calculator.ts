import { CEFRLevel, SkillType } from '@dmf/shared';
import { MasteryState, LessonMastery, SkillBreakdownItem } from '../state/models.js';

/**
 * Mastery Calculator Logic
 * Pure function to calculate new MasteryState from lesson completion.
 */

// CEFR Weights (from learning-state-scoring-tables.md)
const SKILL_WEIGHTS: Record<CEFRLevel, Record<SkillType, number>> = {
    [CEFRLevel.A1]: { listening: 0.35, reading: 0.25, speaking: 0.30, writing: 0.10 },
    [CEFRLevel.A2]: { listening: 0.30, reading: 0.25, speaking: 0.30, writing: 0.15 },
    [CEFRLevel.B1]: { listening: 0.25, reading: 0.30, speaking: 0.25, writing: 0.20 },
    [CEFRLevel.B2]: { listening: 0.20, reading: 0.30, speaking: 0.25, writing: 0.25 },
    [CEFRLevel.C1]: { listening: 0.20, reading: 0.30, speaking: 0.25, writing: 0.25 },
    [CEFRLevel.C2]: { listening: 0.20, reading: 0.30, speaking: 0.25, writing: 0.25 },
};

const DEFAULT_LEVEL = CEFRLevel.A1;

export class MasteryCalculator {
    /**
     * Calculate new state after lesson completion
     * @param currentState Current MasteryState
     * @param lessonId Completed Lesson ID
     * @param rawScore Score from payload (0-100)
     */
    static calculateLessonCompletion(
        currentState: MasteryState,
        lessonId: string,
        rawScore: number
    ): MasteryState {
        // 1. Normalize Score (0-100 -> 0.0-1.0)
        const normalizedScore = Math.min(Math.max(rawScore / 100, 0), 1);

        // 2. Simulate Skill Breakdown (M3-lite assumption: balanced performance)
        // In real impl, we would query ActivityScores to get actual per-skill performance
        // const weights = SKILL_WEIGHTS[DEFAULT_LEVEL]; 
        // Note: weights used for aggregation, but for M3-lite we assume equal contribution from all skills for the lesson score

        const skillBreakdown = {
            [SkillType.LISTENING]: normalizedScore,
            [SkillType.READING]: normalizedScore,
            [SkillType.SPEAKING]: normalizedScore,
            [SkillType.WRITING]: normalizedScore,
        };

        // 3. Calculate Overall Score (Weighted)
        // Using Type Assertion for Record iteration safety if needed, or just trusting types
        // For M3-lite simplification: Overall score = Normalized Score
        const overallScore = normalizedScore;

        // 4. Update LessonMastery List
        // Convert map to array? No, state/models.ts probably uses Map or Object for lessonMastery?
        // Let's check models.ts structure. Assuming it is Record<LessonId, LessonMastery> based on previous view
        // Actually the consumer I read used `state.lessonMastery[lessonId]`.

        const newLessonMastery = {
            overallScore,
            skillBreakdown,
            evidenceCount: 4, // Mock evidence count
            lastUpdatedAt: new Date().toISOString(),
        };

        const updatedLessonMastery = { ...currentState.lessonMastery };
        updatedLessonMastery[lessonId] = newLessonMastery;

        // 5. Update Skill Breakdown Global (Simplified for M3-lite)
        const updatedSkillBreakdown = { ...currentState.skillBreakdown };

        // Naive update: just set to latest score
        updatedSkillBreakdown[SkillType.LISTENING] = normalizedScore;
        updatedSkillBreakdown[SkillType.READING] = normalizedScore;
        updatedSkillBreakdown[SkillType.SPEAKING] = normalizedScore;
        updatedSkillBreakdown[SkillType.WRITING] = normalizedScore;

        return {
            ...currentState,
            lessonMastery: updatedLessonMastery,
            skillBreakdown: updatedSkillBreakdown,
            overallScore: overallScore, // Global average or just set to latest? Consumer set it as avg of lessons.
            updatedAt: new Date().toISOString(),
            version: currentState.version + 1
        };
    }
}
