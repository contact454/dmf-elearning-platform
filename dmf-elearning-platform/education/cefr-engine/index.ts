/**
 * CEFR Engine — S13-01
 * Calculates CEFR level from mastery scores across 5 skills
 */

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface SkillMastery {
    vocabulary: number;  // 0-100
    reading: number;
    listening: number;
    speaking: number;
    writing: number;
}

// Thresholds: minimum average mastery to qualify for a CEFR level
const LEVEL_THRESHOLDS: Array<{ level: CEFRLevel; minAvg: number; minFloor: number }> = [
    { level: 'C2', minAvg: 90, minFloor: 80 },
    { level: 'C1', minAvg: 75, minFloor: 65 },
    { level: 'B2', minAvg: 60, minFloor: 50 },
    { level: 'B1', minAvg: 45, minFloor: 35 },
    { level: 'A2', minAvg: 25, minFloor: 15 },
    { level: 'A1', minAvg: 0, minFloor: 0 },
];

export function assessCEFRLevel(mastery: SkillMastery): CEFRLevel {
    const scores = [mastery.vocabulary, mastery.reading, mastery.listening, mastery.speaking, mastery.writing];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const floor = Math.min(...scores);

    for (const threshold of LEVEL_THRESHOLDS) {
        if (avg >= threshold.minAvg && floor >= threshold.minFloor) {
            return threshold.level;
        }
    }
    return 'A1';
}

export function getSkillBreakdown(mastery: SkillMastery): Array<{ skill: string; score: number; level: CEFRLevel }> {
    return Object.entries(mastery).map(([skill, score]) => ({
        skill,
        score,
        level: assessCEFRLevel({ vocabulary: score, reading: score, listening: score, speaking: score, writing: score }),
    }));
}

export function getCEFRProgress(mastery: SkillMastery): {
    currentLevel: CEFRLevel;
    nextLevel: CEFRLevel | null;
    progressPercent: number;
    weakestSkill: string;
    strongestSkill: string;
} {
    const currentLevel = assessCEFRLevel(mastery);
    const scores = Object.entries(mastery);
    const avg = scores.reduce((a, [, v]) => a + v, 0) / scores.length;

    const currentIdx = LEVEL_THRESHOLDS.findIndex(t => t.level === currentLevel);
    const nextLevel = currentIdx > 0 ? LEVEL_THRESHOLDS[currentIdx - 1].level : null;
    const nextThreshold = currentIdx > 0 ? LEVEL_THRESHOLDS[currentIdx - 1].minAvg : 100;
    const currentThreshold = LEVEL_THRESHOLDS[currentIdx].minAvg;

    const progressPercent = nextLevel
        ? Math.round(((avg - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
        : 100;

    const weakest = scores.reduce((a, b) => a[1] < b[1] ? a : b);
    const strongest = scores.reduce((a, b) => a[1] > b[1] ? a : b);

    return {
        currentLevel,
        nextLevel,
        progressPercent: Math.max(0, Math.min(100, progressPercent)),
        weakestSkill: weakest[0],
        strongestSkill: strongest[0],
    };
}
