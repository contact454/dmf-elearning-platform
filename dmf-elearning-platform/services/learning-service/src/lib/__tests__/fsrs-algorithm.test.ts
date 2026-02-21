/**
 * FSRS Algorithm Unit Tests
 * Tests for the Free Spaced Repetition Scheduler
 */
import { describe, it, expect } from 'vitest';
import {
    createCard,
    scheduleReview,
    sm2ToFSRS,
    getButtonLabels,
    type FSRSCard,
    type Rating,
} from '../../lib/fsrs-algorithm';

describe('FSRS Algorithm', () => {
    describe('createCard', () => {
        it('should create a new card with default values', () => {
            const card = createCard();
            expect(card.state).toBe('new');
            expect(card.stability).toBe(0);
            expect(card.difficulty).toBe(0);
            expect(card.reps).toBe(0);
            expect(card.lapses).toBe(0);
            expect(card.due).toBeInstanceOf(Date);
        });
    });

    describe('scheduleReview - New Card', () => {
        it('should transition to learning on Again (1)', () => {
            const card = createCard();
            const result = scheduleReview(card, 1);
            expect(result.card.state).toBe('learning');
            expect(result.card.lapses).toBe(1);
            expect(result.card.reps).toBe(1);
            expect(result.card.scheduledDays).toBe(0);
        });

        it('should transition to review on Good (3)', () => {
            const card = createCard();
            const result = scheduleReview(card, 3);
            expect(result.card.state).toBe('review');
            expect(result.card.stability).toBeGreaterThan(0);
            expect(result.card.scheduledDays).toBeGreaterThan(0);
        });

        it('should give longer interval for Easy (4) than Good (3)', () => {
            const card = createCard();
            const good = scheduleReview(card, 3);
            const easy = scheduleReview(card, 4);
            expect(easy.card.stability).toBeGreaterThan(good.card.stability);
        });

        it('should set difficulty based on rating', () => {
            const card = createCard();
            const hard = scheduleReview(card, 2);
            const easy = scheduleReview(card, 4);
            expect(hard.card.difficulty).toBeGreaterThan(easy.card.difficulty);
        });
    });

    describe('scheduleReview - Review Card', () => {
        function getReviewCard(): FSRSCard {
            const card = createCard();
            const result = scheduleReview(card, 3); // First review → Good
            // Simulate time passing
            result.card.lastReview = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
            return result.card;
        }

        it('should increase stability on Good (3)', () => {
            const card = getReviewCard();
            const oldStability = card.stability;
            const result = scheduleReview(card, 3);
            expect(result.card.stability).toBeGreaterThan(oldStability);
        });

        it('should transition to relearning on Again (1)', () => {
            const card = getReviewCard();
            const result = scheduleReview(card, 1);
            expect(result.card.state).toBe('relearning');
            expect(result.card.lapses).toBe(1);
        });

        it('should create valid review log', () => {
            const card = getReviewCard();
            const result = scheduleReview(card, 3);
            expect(result.reviewLog.rating).toBe(3);
            expect(result.reviewLog.due).toBeInstanceOf(Date);
            expect(result.reviewLog.stability).toBeGreaterThan(0);
        });
    });

    describe('sm2ToFSRS conversion', () => {
        it('should map SM-2 quality 0-1 to Again (1)', () => {
            expect(sm2ToFSRS(0)).toBe(1);
            expect(sm2ToFSRS(1)).toBe(1);
        });

        it('should map SM-2 quality 3 to Hard (2)', () => {
            expect(sm2ToFSRS(3)).toBe(2);
        });

        it('should map SM-2 quality 4 to Good (3)', () => {
            expect(sm2ToFSRS(4)).toBe(3);
        });

        it('should map SM-2 quality 5 to Easy (4)', () => {
            expect(sm2ToFSRS(5)).toBe(4);
        });
    });

    describe('getButtonLabels', () => {
        it('should return 4 buttons with trilingual labels', () => {
            const labels = getButtonLabels();
            expect(labels).toHaveLength(4);
            expect(labels[0]).toHaveProperty('label');
            expect(labels[0]).toHaveProperty('labelDe');
            expect(labels[0]).toHaveProperty('labelVi');
        });
    });
});
