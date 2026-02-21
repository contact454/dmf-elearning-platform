/**
 * Readiness Model — S13-02
 * Gates learner progression: ensures minimum evidence before advancing
 */

import { CEFRLevel, SkillMastery } from '../cefr-engine';

export interface ReadinessEvidence {
    vocabWordsReviewed: number;
    readingPassagesCompleted: number;
    listeningExercisesCompleted: number;
    speakingAttemptsCount: number;
    writingSubmissionsCount: number;
    daysActive: number;
}

// Minimum evidence required per CEFR level transition
const EVIDENCE_REQUIREMENTS: Record<string, ReadinessEvidence> = {
    'A1→A2': { vocabWordsReviewed: 100, readingPassagesCompleted: 10, listeningExercisesCompleted: 10, speakingAttemptsCount: 5, writingSubmissionsCount: 5, daysActive: 14 },
    'A2→B1': { vocabWordsReviewed: 300, readingPassagesCompleted: 25, listeningExercisesCompleted: 25, speakingAttemptsCount: 15, writingSubmissionsCount: 10, daysActive: 30 },
    'B1→B2': { vocabWordsReviewed: 600, readingPassagesCompleted: 50, listeningExercisesCompleted: 50, speakingAttemptsCount: 30, writingSubmissionsCount: 20, daysActive: 60 },
    'B2→C1': { vocabWordsReviewed: 1000, readingPassagesCompleted: 80, listeningExercisesCompleted: 80, speakingAttemptsCount: 50, writingSubmissionsCount: 40, daysActive: 90 },
    'C1→C2': { vocabWordsReviewed: 2000, readingPassagesCompleted: 120, listeningExercisesCompleted: 120, speakingAttemptsCount: 80, writingSubmissionsCount: 60, daysActive: 120 },
};

// Minimum mastery score floors per skill to advance
const SKILL_FLOORS: Record<string, number> = {
    'A1→A2': 20,
    'A2→B1': 40,
    'B1→B2': 55,
    'B2→C1': 70,
    'C1→C2': 85,
};

export interface ReadinessResult {
    ready: boolean;
    currentLevel: CEFRLevel;
    targetLevel: CEFRLevel;
    evidenceStatus: Array<{ requirement: string; current: number; required: number; met: boolean }>;
    skillFloors: Array<{ skill: string; current: number; required: number; met: boolean }>;
    overallPercent: number;
}

export function checkReadiness(
    currentLevel: CEFRLevel,
    mastery: SkillMastery,
    evidence: ReadinessEvidence,
): ReadinessResult {
    const nextLevels: Record<CEFRLevel, CEFRLevel | null> = {
        A1: 'A2', A2: 'B1', B1: 'B2', B2: 'C1', C1: 'C2', C2: null,
    };

    const targetLevel = nextLevels[currentLevel];
    if (!targetLevel) {
        return { ready: true, currentLevel, targetLevel: 'C2', evidenceStatus: [], skillFloors: [], overallPercent: 100 };
    }

    const transKey = `${currentLevel}→${targetLevel}`;
    const req = EVIDENCE_REQUIREMENTS[transKey];
    const floor = SKILL_FLOORS[transKey] || 0;

    const evidenceStatus = [
        { requirement: 'Vocabulary reviewed', current: evidence.vocabWordsReviewed, required: req.vocabWordsReviewed, met: evidence.vocabWordsReviewed >= req.vocabWordsReviewed },
        { requirement: 'Reading completed', current: evidence.readingPassagesCompleted, required: req.readingPassagesCompleted, met: evidence.readingPassagesCompleted >= req.readingPassagesCompleted },
        { requirement: 'Listening completed', current: evidence.listeningExercisesCompleted, required: req.listeningExercisesCompleted, met: evidence.listeningExercisesCompleted >= req.listeningExercisesCompleted },
        { requirement: 'Speaking attempts', current: evidence.speakingAttemptsCount, required: req.speakingAttemptsCount, met: evidence.speakingAttemptsCount >= req.speakingAttemptsCount },
        { requirement: 'Writing submissions', current: evidence.writingSubmissionsCount, required: req.writingSubmissionsCount, met: evidence.writingSubmissionsCount >= req.writingSubmissionsCount },
        { requirement: 'Days active', current: evidence.daysActive, required: req.daysActive, met: evidence.daysActive >= req.daysActive },
    ];

    const skillFloors = Object.entries(mastery).map(([skill, score]) => ({
        skill, current: score, required: floor, met: score >= floor,
    }));

    const totalChecks = evidenceStatus.length + skillFloors.length;
    const metChecks = evidenceStatus.filter(e => e.met).length + skillFloors.filter(s => s.met).length;
    const overallPercent = Math.round((metChecks / totalChecks) * 100);

    return {
        ready: evidenceStatus.every(e => e.met) && skillFloors.every(s => s.met),
        currentLevel, targetLevel, evidenceStatus, skillFloors, overallPercent,
    };
}
