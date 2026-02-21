/**
 * Speech Recognition Service Unit Tests
 */
import { describe, it, expect } from 'vitest';
import {
    comparePronunciation,
    scoreSpeakingAttempt,
    getPronunciationGuide,
    getDifficultSounds,
} from '../SpeechRecognitionService';

describe('SpeechRecognitionService', () => {
    describe('comparePronunciation', () => {
        it('should return perfect score for exact match', () => {
            const result = comparePronunciation('Hallo', 'Hallo');
            expect(result.score).toBe(100);
            expect(result.overallGrade).toBe('excellent');
            expect(result.feedback).toHaveLength(0);
        });

        it('should be case-insensitive', () => {
            const result = comparePronunciation('Hallo', 'hallo');
            expect(result.score).toBe(100);
        });

        it('should detect word substitutions', () => {
            const result = comparePronunciation('Guten Morgen', 'Guten Abend');
            expect(result.score).toBe(50);
            const sub = result.feedback.find(f => f.type === 'substitution');
            expect(sub).toBeDefined();
            expect(sub!.expected).toBe('morgen');
            expect(sub!.actual).toBe('abend');
        });

        it('should detect missing words', () => {
            const result = comparePronunciation('Ich bin Student', 'Ich bin');
            const deletion = result.feedback.find(f => f.type === 'deletion');
            expect(deletion).toBeDefined();
            expect(deletion!.expected).toBe('student');
        });

        it('should detect extra words', () => {
            const result = comparePronunciation('Hallo', 'Hallo Welt');
            const insertion = result.feedback.find(f => f.type === 'insertion');
            expect(insertion).toBeDefined();
        });

        it('should grade as needs_practice for low score', () => {
            const result = comparePronunciation('Entschuldigung bitte', 'wrong words here');
            expect(result.overallGrade).toBe('needs_practice');
        });

        it('should provide Vietnamese encouragement', () => {
            const result = comparePronunciation('Test', 'Wrong');
            expect(result.encouragement).toBeDefined();
            expect(result.encouragement.length).toBeGreaterThan(0);
        });
    });

    describe('scoreSpeakingAttempt', () => {
        it('should give fluency bonus for fast response', () => {
            const fast = scoreSpeakingAttempt('Hallo', 'Hallo', 3000);
            const slow = scoreSpeakingAttempt('Hallo', 'Hallo', 15000);
            expect(fast.fluencyBonus).toBeGreaterThan(slow.fluencyBonus);
        });

        it('should include difficult sounds guide', () => {
            const result = scoreSpeakingAttempt('Übung', 'Ubung', 5000);
            expect(result.difficultSounds.length).toBeGreaterThan(0);
        });

        it('should cap score at 100', () => {
            const result = scoreSpeakingAttempt('Hi', 'Hi', 1000);
            expect(result.score).toBeLessThanOrEqual(100);
        });
    });

    describe('getPronunciationGuide', () => {
        it('should return guide for ü', () => {
            const guide = getPronunciationGuide('Übung');
            const u = guide.find(g => g.sound === 'ü');
            expect(u).toBeDefined();
            expect(u!.ipa).toBe('/yː/');
            expect(u!.tipVi).toBeDefined();
        });

        it('should return guide for sch', () => {
            const guide = getPronunciationGuide('Schule');
            const sch = guide.find(g => g.sound === 'sch');
            expect(sch).toBeDefined();
        });

        it('should return empty for simple words', () => {
            const guide = getPronunciationGuide('Mama');
            expect(guide).toHaveLength(0);
        });

        it('should find multiple difficult sounds', () => {
            const guide = getPronunciationGuide('Entschuldigung');
            expect(guide.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('getDifficultSounds', () => {
        it('should return all difficult sound entries', () => {
            const sounds = getDifficultSounds();
            expect(sounds.length).toBeGreaterThan(10);
            sounds.forEach(s => {
                expect(s.sound).toBeDefined();
                expect(s.ipa).toBeDefined();
                expect(s.tip).toBeDefined();
                expect(s.tipVi).toBeDefined();
            });
        });
    });
});
