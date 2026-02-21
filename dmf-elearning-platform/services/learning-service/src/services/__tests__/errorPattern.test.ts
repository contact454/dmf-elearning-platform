/**
 * Error Pattern Service Unit Tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    recordError,
    analyzePatterns,
    getWeaknessReport,
    clearErrors,
} from '../ErrorPatternService';

describe('ErrorPatternService', () => {
    const userId = 'test-user';

    beforeEach(() => {
        clearErrors(userId);
    });

    describe('recordError', () => {
        it('should record an error', () => {
            recordError({
                userId,
                type: 'grammar',
                skill: 'writing',
                details: 'Wrong article',
                context: 'A1 Exercise',
                timestamp: new Date(),
                level: 'A1',
            });
            const patterns = analyzePatterns(userId);
            expect(patterns.length).toBe(1);
            expect(patterns[0].type).toBe('grammar');
        });
    });

    describe('analyzePatterns', () => {
        it('should identify high frequency patterns', () => {
            for (let i = 0; i < 10; i++) {
                recordError({ userId, type: 'grammar', skill: 'writing', details: 'Article error', context: 'Ex1', timestamp: new Date(), level: 'A1' });
            }
            for (let i = 0; i < 3; i++) {
                recordError({ userId, type: 'vocabulary', skill: 'vocabulary', details: 'Forgot word', context: 'Ex2', timestamp: new Date(), level: 'A1' });
            }

            const patterns = analyzePatterns(userId);
            expect(patterns[0].type).toBe('grammar');
            expect(patterns[0].frequency).toBe('high');
        });

        it('should return empty for user with no errors', () => {
            const patterns = analyzePatterns('nonexistent-user');
            expect(patterns).toHaveLength(0);
        });

        it('should limit examples to 3', () => {
            for (let i = 0; i < 10; i++) {
                recordError({ userId, type: 'spelling', skill: 'writing', details: `Error ${i}`, context: 'Ex', timestamp: new Date(), level: 'A1' });
            }
            const patterns = analyzePatterns(userId);
            expect(patterns[0].examples.length).toBeLessThanOrEqual(3);
        });
    });

    describe('getWeaknessReport', () => {
        it('should generate recommendations', () => {
            for (let i = 0; i < 5; i++) {
                recordError({ userId, type: 'grammar', skill: 'grammar', details: 'Verb conjugation', context: 'Ex', timestamp: new Date(), level: 'A1' });
            }

            const report = getWeaknessReport(userId);
            expect(report.userId).toBe(userId);
            expect(report.analyzedErrors).toBe(5);
            expect(report.recommendations.length).toBeGreaterThan(0);
            expect(report.recommendations[0].title).toBeDefined();
            expect(report.recommendations[0].suggestedExercise).toBeDefined();
        });

        it('should return 100% accuracy for no errors', () => {
            clearErrors(userId);
            const report = getWeaknessReport(userId);
            expect(report.overallAccuracy).toBe(100);
        });
    });

    describe('clearErrors', () => {
        it('should remove all errors for user', () => {
            recordError({ userId, type: 'grammar', skill: 'writing', details: 'Test', context: 'Ex', timestamp: new Date(), level: 'A1' });
            clearErrors(userId);
            expect(analyzePatterns(userId)).toHaveLength(0);
        });
    });
});
