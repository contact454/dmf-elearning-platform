/**
 * Unit Tests for Listening SRS Algorithm
 * 
 * Tests:
 * - Quality rating calculation
 * - Next review calculation
 * - Edge cases and error handling
 */

import { describe, it, expect } from 'vitest';
import { calculateQualityRating, calculateNextReview, type QualityRating } from '../listening-srs';

describe('Listening SRS Algorithm', () => {
  describe('calculateQualityRating', () => {
    // Perfect score scenarios
    it('should return quality 5 for 100% accuracy on first attempt', () => {
      const quality = calculateQualityRating(true, 100, 5, 5, 1);
      expect(quality).toBe(5);
    });
    
    // Excellent score scenarios
    it('should return quality 4 for 90% accuracy on first attempt', () => {
      const quality = calculateQualityRating(true, 90, 5, 5, 1);
      expect(quality).toBe(4);
    });
    
    it('should return quality 4 for 95% accuracy on first attempt', () => {
      const quality = calculateQualityRating(true, 95, 5, 5, 1);
      expect(quality).toBe(4);
    });
    
    // Good score scenarios
    it('should return quality 3 for 80% accuracy on first attempt', () => {
      const quality = calculateQualityRating(true, 80, 5, 5, 1);
      expect(quality).toBe(3);
    });
    
    it('should return quality 3 for 100% accuracy on second attempt', () => {
      const quality = calculateQualityRating(true, 100, 10, 5, 2);
      expect(quality).toBe(3);
    });
    
    it('should return quality 3 for 85% accuracy on multiple attempts', () => {
      const quality = calculateQualityRating(true, 85, 15, 5, 3);
      expect(quality).toBe(3);
    });
    
    // Passing score scenarios
    it('should return quality 2 for 70% accuracy', () => {
      const quality = calculateQualityRating(true, 70, 10, 5, 2);
      expect(quality).toBe(2);
    });
    
    it('should return quality 2 for 75% accuracy', () => {
      const quality = calculateQualityRating(true, 75, 12, 5, 2);
      expect(quality).toBe(2);
    });
    
    // Barely passing scenarios
    it('should return quality 1 for 60% accuracy', () => {
      const quality = calculateQualityRating(true, 60, 20, 5, 3);
      expect(quality).toBe(1);
    });
    
    it('should return quality 1 for 65% accuracy', () => {
      const quality = calculateQualityRating(true, 65, 18, 5, 3);
      expect(quality).toBe(1);
    });
    
    // Fail scenarios
    it('should return quality 0 for incorrect answer', () => {
      const quality = calculateQualityRating(false, 30, 20, 5, 5);
      expect(quality).toBe(0);
    });
    
    it('should return quality 0 for 0% accuracy', () => {
      const quality = calculateQualityRating(false, 0, 25, 5, 4);
      expect(quality).toBe(0);
    });
    
    it('should return quality 0 for 50% accuracy (below pass threshold)', () => {
      const quality = calculateQualityRating(true, 50, 15, 5, 2);
      expect(quality).toBe(0);
    });
    
    // Edge cases
    it('should handle exactly 60% accuracy (boundary)', () => {
      const quality = calculateQualityRating(true, 60, 10, 5, 1);
      expect(quality).toBe(1);
    });
    
    it('should handle exactly 70% accuracy (boundary)', () => {
      const quality = calculateQualityRating(true, 70, 10, 5, 1);
      expect(quality).toBe(2);
    });
    
    it('should handle exactly 80% accuracy (boundary)', () => {
      const quality = calculateQualityRating(true, 80, 10, 5, 1);
      expect(quality).toBe(3);
    });
    
    it('should handle exactly 90% accuracy (boundary)', () => {
      const quality = calculateQualityRating(true, 90, 10, 5, 1);
      expect(quality).toBe(4);
    });
    
    // Error handling
    it('should throw error for invalid accuracy_score < 0', () => {
      expect(() => calculateQualityRating(true, -10, 5, 5, 1))
        .toThrow('Invalid accuracy_score');
    });
    
    it('should throw error for invalid accuracy_score > 100', () => {
      expect(() => calculateQualityRating(true, 150, 5, 5, 1))
        .toThrow('Invalid accuracy_score');
    });
    
    it('should throw error for invalid attempts < 1', () => {
      expect(() => calculateQualityRating(true, 80, 5, 5, 0))
        .toThrow('Invalid attempts');
    });
  });
  
  describe('calculateNextReview', () => {
    // First review (interval 0 → 1)
    it('should set interval to 1 day for first review with quality 5', () => {
      const currentProgress = { ease_factor: 2.5, interval_days: 0 };
      const result = calculateNextReview(currentProgress, 5);
      
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeGreaterThan(2.5); // Should increase
    });
    
    it('should set interval to 1 day for first review with quality 3', () => {
      const currentProgress = { ease_factor: 2.5, interval_days: 0 };
      const result = calculateNextReview(currentProgress, 3);
      
      expect(result.interval).toBe(1);
    });
    
    // Second review (interval 1 → 6)
    it('should set interval to 6 days for second review with quality 5', () => {
      const currentProgress = { ease_factor: 2.5, interval_days: 1 };
      const result = calculateNextReview(currentProgress, 5);
      
      expect(result.interval).toBe(6);
    });
    
    it('should set interval to 6 days for second review with quality 4', () => {
      const currentProgress = { ease_factor: 2.5, interval_days: 1 };
      const result = calculateNextReview(currentProgress, 4);
      
      expect(result.interval).toBe(6);
    });
    
    // Third review (interval 6 → 15 for quality 5 with EF 2.5)
    it('should multiply interval by ease factor for third review', () => {
      const currentProgress = { ease_factor: 2.5, interval_days: 6 };
      const result = calculateNextReview(currentProgress, 5);
      
      expect(result.interval).toBe(15); // 6 * 2.5 = 15
    });
    
    it('should multiply interval by ease factor for fourth review', () => {
      const currentProgress = { ease_factor: 2.6, interval_days: 15 };
      const result = calculateNextReview(currentProgress, 4);
      
      expect(result.interval).toBe(39); // 15 * 2.6 = 39
    });
    
    // Fail scenarios (quality < 3)
    it('should reset interval to 1 for quality 0 (incorrect)', () => {
      const currentProgress = { ease_factor: 2.5, interval_days: 15 };
      const result = calculateNextReview(currentProgress, 0);
      
      expect(result.interval).toBe(1);
    });
    
    it('should reset interval to 1 for quality 1', () => {
      const currentProgress = { ease_factor: 2.5, interval_days: 30 };
      const result = calculateNextReview(currentProgress, 1);
      
      expect(result.interval).toBe(1);
    });
    
    it('should reset interval to 1 for quality 2', () => {
      const currentProgress = { ease_factor: 2.5, interval_days: 60 };
      const result = calculateNextReview(currentProgress, 2);
      
      expect(result.interval).toBe(1);
    });
    
    // Ease factor adjustments
    it('should increase ease factor for quality 5', () => {
      const currentProgress = { ease_factor: 2.5, interval_days: 6 };
      const result = calculateNextReview(currentProgress, 5);
      
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });
    
    it('should decrease ease factor for quality 3', () => {
      const currentProgress = { ease_factor: 2.5, interval_days: 6 };
      const result = calculateNextReview(currentProgress, 3);
      
      expect(result.easeFactor).toBeLessThan(2.5);
    });
    
    it('should not let ease factor drop below 1.3', () => {
      const currentProgress = { ease_factor: 1.3, interval_days: 6 };
      const result = calculateNextReview(currentProgress, 0);
      
      expect(result.easeFactor).toBe(1.3);
    });
    
    // Next review date
    it('should return a valid future date', () => {
      const currentProgress = { ease_factor: 2.5, interval_days: 0 };
      const result = calculateNextReview(currentProgress, 5);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      expect(result.nextReviewAt.getTime()).toBe(tomorrow.getTime());
    });
    
    it('should normalize next review to midnight', () => {
      const currentProgress = { ease_factor: 2.5, interval_days: 3 };
      const result = calculateNextReview(currentProgress, 4);
      
      expect(result.nextReviewAt.getHours()).toBe(0);
      expect(result.nextReviewAt.getMinutes()).toBe(0);
      expect(result.nextReviewAt.getSeconds()).toBe(0);
    });
    
    // Rounding
    it('should round ease factor to 2 decimals', () => {
      const currentProgress = { ease_factor: 2.333333, interval_days: 6 };
      const result = calculateNextReview(currentProgress, 5);
      
      expect(result.easeFactor.toString()).toMatch(/^\d+\.\d{1,2}$/);
    });
    
    it('should round interval to nearest integer', () => {
      const currentProgress = { ease_factor: 2.3, interval_days: 7 };
      const result = calculateNextReview(currentProgress, 5);
      
      expect(Number.isInteger(result.interval)).toBe(true);
    });
  });
  
  describe('Integration: Quality Rating + Next Review', () => {
    it('should handle perfect score flow correctly', () => {
      // Perfect score on first attempt
      const quality = calculateQualityRating(true, 100, 5, 5, 1);
      expect(quality).toBe(5);
      
      // First review
      const progress1 = { ease_factor: 2.5, interval_days: 0 };
      const next1 = calculateNextReview(progress1, quality);
      expect(next1.interval).toBe(1);
      
      // Second review (still perfect)
      const progress2 = { ease_factor: next1.easeFactor, interval_days: next1.interval };
      const next2 = calculateNextReview(progress2, quality);
      expect(next2.interval).toBe(6);
      
      // Third review (still perfect)
      const progress3 = { ease_factor: next2.easeFactor, interval_days: next2.interval };
      const next3 = calculateNextReview(progress3, quality);
      expect(next3.interval).toBeGreaterThan(10);
    });
    
    it('should handle fail-then-pass flow correctly', () => {
      // Failed first attempt
      const quality1 = calculateQualityRating(false, 30, 20, 5, 1);
      expect(quality1).toBe(0);
      
      const progress1 = { ease_factor: 2.5, interval_days: 0 };
      const next1 = calculateNextReview(progress1, quality1);
      expect(next1.interval).toBe(1);
      
      // Passed second attempt (80%)
      const quality2 = calculateQualityRating(true, 80, 10, 5, 2);
      expect(quality2).toBe(3);
      
      const progress2 = { ease_factor: next1.easeFactor, interval_days: next1.interval };
      const next2 = calculateNextReview(progress2, quality2);
      expect(next2.interval).toBe(6);
    });
  });
});
