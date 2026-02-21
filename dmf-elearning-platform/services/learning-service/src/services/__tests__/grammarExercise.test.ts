/**
 * Grammar Exercise Service Unit Tests
 */
import { describe, it, expect } from 'vitest';
import {
    getExercises,
    getExercisesForClient,
    checkAnswer,
    getTopics,
    getExerciseTypes,
} from '../GrammarExerciseService';

describe('GrammarExerciseService', () => {
    describe('getExercises', () => {
        it('should return A1 exercises', () => {
            const exercises = getExercises('A1');
            expect(exercises.length).toBeGreaterThan(0);
            exercises.forEach(e => expect(e.level).toBe('A1'));
        });

        it('should filter by type', () => {
            const exercises = getExercises('A1', 'fill_blank');
            exercises.forEach(e => expect(e.type).toBe('fill_blank'));
        });

        it('should respect limit', () => {
            const exercises = getExercises('A1', undefined, 2);
            expect(exercises.length).toBeLessThanOrEqual(2);
        });

        it('should return exercises for all levels', () => {
            for (const level of ['A1', 'A2', 'B1', 'B2'] as const) {
                const exercises = getExercises(level);
                expect(exercises.length).toBeGreaterThan(0);
            }
        });
    });

    describe('getExercisesForClient', () => {
        it('should NOT include correctAnswer', () => {
            const exercises = getExercisesForClient('A1');
            exercises.forEach(e => {
                expect(e).not.toHaveProperty('correctAnswer');
                expect(e).toHaveProperty('question');
                expect(e).toHaveProperty('options');
            });
        });
    });

    describe('checkAnswer', () => {
        it('should return correct for right answer', () => {
            const result = checkAnswer('a1-conj-1', 'bin');
            expect(result.correct).toBe(true);
            expect(result.xpEarned).toBeGreaterThan(0);
        });

        it('should return incorrect for wrong answer', () => {
            const result = checkAnswer('a1-conj-1', 'bist');
            expect(result.correct).toBe(false);
            expect(result.xpEarned).toBe(0);
        });

        it('should be case-insensitive', () => {
            const result = checkAnswer('a1-conj-1', 'BIN');
            expect(result.correct).toBe(true);
        });

        it('should throw for invalid exerciseId', () => {
            expect(() => checkAnswer('nonexistent', 'test')).toThrow();
        });

        it('should return explanation', () => {
            const result = checkAnswer('a1-conj-1', 'ist');
            expect(result.explanation).toBeDefined();
            expect(result.explanation.length).toBeGreaterThan(0);
        });
    });

    describe('getTopics', () => {
        it('should return topics for A1', () => {
            const topics = getTopics('A1');
            expect(topics.length).toBeGreaterThan(0);
            expect(topics).toContain('Konjugation: sein');
        });

        it('should return all topics when no level specified', () => {
            const all = getTopics();
            const a1 = getTopics('A1');
            expect(all.length).toBeGreaterThanOrEqual(a1.length);
        });
    });

    describe('getExerciseTypes', () => {
        it('should return 4 exercise types', () => {
            const types = getExerciseTypes();
            expect(types).toHaveLength(4);
            expect(types).toContain('fill_blank');
            expect(types).toContain('conjugation');
            expect(types).toContain('reorder');
            expect(types).toContain('error_correction');
        });
    });
});
