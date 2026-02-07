import { describe, it, expect } from 'vitest'
import { calculateNextReview, buttonToQuality, type CardState } from '../srs-algorithm'

describe('SM-2 Algorithm', () => {
  describe('calculateNextReview', () => {
    it('should handle first successful review (quality 4)', () => {
      const state: CardState = {
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 0,
        lastReview: new Date()
      }
      
      const result = calculateNextReview(state, 4)
      
      expect(result.repetitions).toBe(1)
      expect(result.intervalDays).toBe(1) // First review always 1 day
      expect(result.status).toBe('LEARNING')
      expect(result.easeFactor).toBeGreaterThanOrEqual(2.5) // Should stay same or increase
    })
    
    it('should handle second successful review', () => {
      const state: CardState = {
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 1,
        lastReview: new Date()
      }
      
      const result = calculateNextReview(state, 4)
      
      expect(result.repetitions).toBe(2)
      expect(result.intervalDays).toBe(6) // Second review always 6 days
      expect(result.status).toBe('LEARNING')
    })
    
    it('should handle third successful review with ease factor', () => {
      const state: CardState = {
        easeFactor: 2.5,
        intervalDays: 6,
        repetitions: 2,
        lastReview: new Date()
      }
      
      const result = calculateNextReview(state, 4)
      
      expect(result.repetitions).toBe(3)
      expect(result.intervalDays).toBe(15) // 6 * 2.5 = 15
      expect(result.status).toBe('REVIEW')
    })
    
    it('should reset progress on failed review (quality < 3)', () => {
      const state: CardState = {
        easeFactor: 2.5,
        intervalDays: 15,
        repetitions: 3,
        lastReview: new Date()
      }
      
      const result = calculateNextReview(state, 1) // Failed
      
      expect(result.repetitions).toBe(0)
      expect(result.intervalDays).toBe(1)
      expect(result.status).toBe('NEW')
    })
    
    it('should clamp ease factor to minimum 1.3', () => {
      const state: CardState = {
        easeFactor: 1.3,
        intervalDays: 10,
        repetitions: 3,
        lastReview: new Date()
      }
      
      const result = calculateNextReview(state, 3) // Difficult pass
      
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3)
    })
    
    it('should mark as MASTERED after interval >= 21 days', () => {
      const state: CardState = {
        easeFactor: 2.5,
        intervalDays: 15,
        repetitions: 3,
        lastReview: new Date()
      }
      
      const result = calculateNextReview(state, 5) // Perfect
      
      // 15 * 2.6 = 39 days (should be MASTERED)
      expect(result.intervalDays).toBeGreaterThanOrEqual(21)
      expect(result.status).toBe('MASTERED')
    })
    
    it('should throw error on invalid quality score', () => {
      const state: CardState = {
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 0,
        lastReview: new Date()
      }
      
      expect(() => calculateNextReview(state, 6 as any)).toThrow('Invalid quality score')
      expect(() => calculateNextReview(state, -1 as any)).toThrow('Invalid quality score')
    })
    
    it('should handle quality 0 (total blackout)', () => {
      const state: CardState = {
        easeFactor: 2.5,
        intervalDays: 10,
        repetitions: 2,
        lastReview: new Date()
      }
      
      const result = calculateNextReview(state, 0)
      
      expect(result.repetitions).toBe(0)
      expect(result.intervalDays).toBe(1)
      expect(result.status).toBe('NEW')
    })
    
    it('should handle quality 2 (incorrect but remembered)', () => {
      const state: CardState = {
        easeFactor: 2.5,
        intervalDays: 10,
        repetitions: 2,
        lastReview: new Date()
      }
      
      const result = calculateNextReview(state, 2)
      
      expect(result.repetitions).toBe(0) // Failed, reset
      expect(result.intervalDays).toBe(1)
    })
    
    it('should handle quality 3 (correct with difficulty)', () => {
      const state: CardState = {
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 0,
        lastReview: new Date()
      }
      
      const result = calculateNextReview(state, 3)
      
      expect(result.repetitions).toBe(1) // Success, increment
      expect(result.intervalDays).toBe(1)
      expect(result.easeFactor).toBeLessThan(2.5) // EF should decrease slightly
    })
    
    it('should handle quality 5 (perfect recall)', () => {
      const state: CardState = {
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 0,
        lastReview: new Date()
      }
      
      const result = calculateNextReview(state, 5)
      
      expect(result.repetitions).toBe(1)
      expect(result.easeFactor).toBeGreaterThan(2.5) // EF should increase
    })
    
    it('should normalize nextReviewDate to midnight', () => {
      const now = new Date()
      now.setHours(14, 30, 45, 123) // 2:30 PM
      
      const state: CardState = {
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 0,
        lastReview: now
      }
      
      const result = calculateNextReview(state, 4)
      
      expect(result.nextReviewDate.getHours()).toBe(0)
      expect(result.nextReviewDate.getMinutes()).toBe(0)
      expect(result.nextReviewDate.getSeconds()).toBe(0)
      expect(result.nextReviewDate.getMilliseconds()).toBe(0)
    })
    
    it('should round ease factor to 2 decimal places', () => {
      const state: CardState = {
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 0,
        lastReview: new Date()
      }
      
      const result = calculateNextReview(state, 4)
      
      // Check that easeFactor has max 2 decimals
      const decimals = (result.easeFactor.toString().split('.')[1] || '').length
      expect(decimals).toBeLessThanOrEqual(2)
    })
  })
  
  describe('buttonToQuality', () => {
    it('should map Again (1) to quality 1', () => {
      expect(buttonToQuality(1)).toBe(1)
    })
    
    it('should map Hard (2) to quality 3', () => {
      expect(buttonToQuality(2)).toBe(3)
    })
    
    it('should map Good (3) to quality 4', () => {
      expect(buttonToQuality(3)).toBe(4)
    })
    
    it('should map Easy (4) to quality 5', () => {
      expect(buttonToQuality(4)).toBe(5)
    })
  })
})
