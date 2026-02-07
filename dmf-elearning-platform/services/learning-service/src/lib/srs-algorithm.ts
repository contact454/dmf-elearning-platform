/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * Based on SuperMemo-2 (1988) by Piotr Wozniak
 * 
 * @see https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 */

export type QualityScore = 0 | 1 | 2 | 3 | 4 | 5

export interface CardState {
  easeFactor: number     // Hệ số dễ (1.3-2.5)
  intervalDays: number   // Khoảng cách ngày (days)
  repetitions: number    // Số lần ôn thành công
  lastReview: Date       // Lần ôn cuối
}

export interface NextReview {
  easeFactor: number
  intervalDays: number
  repetitions: number
  nextReviewDate: Date
  status: 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED'
}

/**
 * Calculate next review date using SM-2 algorithm
 * 
 * @param currentState - Current card state
 * @param quality - Quality score 0-5 (0=total blackout, 5=perfect)
 * @returns Updated card state with next review date
 */
export function calculateNextReview(
  currentState: CardState,
  quality: QualityScore
): NextReview {
  // Validate input
  if (quality < 0 || quality > 5) {
    throw new Error(`Invalid quality score: ${quality}. Must be 0-5.`)
  }
  
  let { easeFactor, intervalDays, repetitions } = currentState
  
  // Quality < 3: Failed review (reset progress)
  if (quality < 3) {
    repetitions = 0
    intervalDays = 1
  } else {
    // Quality >= 3: Successful review (increment progress)
    repetitions += 1
    
    // Calculate new interval based on repetitions
    if (repetitions === 1) {
      intervalDays = 1 // First review: 1 day
    } else if (repetitions === 2) {
      intervalDays = 6 // Second review: 6 days
    } else {
      // Subsequent reviews: multiply by ease factor
      intervalDays = Math.round(intervalDays * easeFactor)
    }
    
    // Update ease factor using SM-2 formula
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    
    // Clamp ease factor to minimum 1.3
    easeFactor = Math.max(1.3, easeFactor)
  }
  
  // Calculate next review date
  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays)
  nextReviewDate.setHours(0, 0, 0, 0) // Normalize to midnight
  
  // Determine status based on progress
  let status: 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED'
  if (repetitions === 0) {
    status = 'NEW'
  } else if (repetitions < 3) {
    status = 'LEARNING'
  } else if (intervalDays < 21) {
    status = 'REVIEW'
  } else {
    status = 'MASTERED'
  }
  
  return {
    easeFactor: Math.round(easeFactor * 100) / 100, // Round to 2 decimals
    intervalDays,
    repetitions,
    nextReviewDate,
    status
  }
}

/**
 * Convert quality button to SM-2 score
 * Frontend uses: Again(1), Hard(2), Good(3), Easy(4)
 * SM-2 uses: 0-5 scale
 */
export function buttonToQuality(button: 1 | 2 | 3 | 4): QualityScore {
  const mapping: Record<1 | 2 | 3 | 4, QualityScore> = {
    1: 1, // Again → fail
    2: 3, // Hard → difficult pass
    3: 4, // Good → normal pass
    4: 5  // Easy → perfect pass
  }
  return mapping[button]
}
