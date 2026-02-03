/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Based on the SuperMemo SM-2 algorithm by Piotr Wozniak
 * https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 *
 * Quality ratings:
 * 0 - Complete blackout, no recall
 * 1 - Incorrect response, but upon seeing correct answer, remembered
 * 2 - Incorrect response, but correct answer seemed easy to recall
 * 3 - Correct response with serious difficulty
 * 4 - Correct response after hesitation
 * 5 - Perfect response with no hesitation
 */

export interface SRSCard {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

export interface SRSUpdate {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: Date;
  status: 'new' | 'learning' | 'review' | 'mastered';
}

export interface ReviewResult {
  quality: number; // 0-5
  reviewedAt: Date;
}

/**
 * Calculate next review parameters using SM-2 algorithm
 *
 * @param quality - Rating from 0 (complete failure) to 5 (perfect)
 * @param currentCard - Current SRS state of the card
 * @returns Updated SRS parameters and next review date
 */
export function calculateNextReview(
  quality: number,
  currentCard: SRSCard
): SRSUpdate {
  // Clamp quality to valid range
  quality = Math.max(0, Math.min(5, Math.round(quality)));

  let { easeFactor, interval, repetitions } = currentCard;

  // Calculate new ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const newEaseFactor = Math.max(
    1.3, // Minimum ease factor
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  let newInterval: number;
  let newRepetitions: number;
  let status: 'new' | 'learning' | 'review' | 'mastered';

  if (quality < 3) {
    // Failed review - reset to beginning
    newRepetitions = 0;
    newInterval = 1; // Review again tomorrow
    status = 'learning';
  } else {
    // Successful review
    newRepetitions = repetitions + 1;

    if (repetitions === 0) {
      // First successful review
      newInterval = 1;
      status = 'learning';
    } else if (repetitions === 1) {
      // Second successful review
      newInterval = 6;
      status = 'review';
    } else {
      // Subsequent reviews
      newInterval = Math.round(interval * newEaseFactor);
      status = newInterval >= 21 ? 'mastered' : 'review';
    }
  }

  // Calculate next review date
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);
  nextReviewAt.setHours(0, 0, 0, 0); // Set to start of day

  return {
    easeFactor: Math.round(newEaseFactor * 100) / 100, // Round to 2 decimals
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewAt,
    status,
  };
}

/**
 * Map user-friendly rating to SM-2 quality
 *
 * UI Buttons -> SM-2 Quality:
 * - Again (0) -> 0 (complete failure)
 * - Hard (1)  -> 2 (incorrect but remembered)
 * - Good (2)  -> 4 (correct with hesitation)
 * - Easy (3)  -> 5 (perfect)
 */
export function mapRatingToQuality(rating: number): number {
  const ratingMap: Record<number, number> = {
    0: 0, // Again -> Complete blackout
    1: 2, // Hard -> Incorrect but seemed easy
    2: 4, // Good -> Correct with hesitation
    3: 5, // Easy -> Perfect
  };
  return ratingMap[rating] ?? 3;
}

/**
 * Get cards that are due for review
 *
 * @param nextReviewAt - Scheduled review date
 * @returns true if card is due
 */
export function isDue(nextReviewAt: Date | null): boolean {
  if (!nextReviewAt) return true; // New cards are always due
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return nextReviewAt <= now;
}

/**
 * Calculate retention rate
 *
 * @param correctReviews - Number of correct reviews
 * @param totalReviews - Total number of reviews
 * @returns Retention percentage (0-100)
 */
export function calculateRetention(
  correctReviews: number,
  totalReviews: number
): number {
  if (totalReviews === 0) return 0;
  return Math.round((correctReviews / totalReviews) * 100);
}

/**
 * Estimate days until card is considered "mastered"
 * Based on current progress and average ease factor
 *
 * @param repetitions - Current successful repetitions
 * @param easeFactor - Current ease factor
 * @returns Estimated days to mastery
 */
export function estimateDaysToMastery(
  repetitions: number,
  easeFactor: number
): number {
  // Mastery threshold: 21 days interval (3 weeks)
  const masteryInterval = 21;

  if (repetitions === 0) {
    // Need at least 3 successful reviews: 1 + 6 + 6*EF
    return 1 + 6 + Math.round(6 * easeFactor);
  } else if (repetitions === 1) {
    // Already passed first review: 6 + 6*EF
    return 6 + Math.round(6 * easeFactor);
  } else {
    // Calculate remaining intervals
    let interval = 6;
    let days = 0;
    let reps = repetitions;

    while (interval < masteryInterval) {
      interval = Math.round(interval * easeFactor);
      days += interval;
      reps++;
      if (reps > 10) break; // Safety limit
    }

    return days;
  }
}

/**
 * Get learning statistics summary
 */
export interface LearningStats {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  masteredCards: number;
  dueToday: number;
  averageEaseFactor: number;
  averageRetention: number;
}

export function calculateLearningStats(
  cards: Array<{
    status: string;
    nextReviewAt: Date | null;
    easeFactor: number;
    correctReviews: number;
    totalReviews: number;
  }>
): LearningStats {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const stats: LearningStats = {
    totalCards: cards.length,
    newCards: 0,
    learningCards: 0,
    reviewCards: 0,
    masteredCards: 0,
    dueToday: 0,
    averageEaseFactor: 2.5,
    averageRetention: 0,
  };

  let totalEF = 0;
  let totalCorrect = 0;
  let totalReviews = 0;

  for (const card of cards) {
    switch (card.status) {
      case 'new':
        stats.newCards++;
        break;
      case 'learning':
        stats.learningCards++;
        break;
      case 'review':
        stats.reviewCards++;
        break;
      case 'mastered':
        stats.masteredCards++;
        break;
    }

    if (isDue(card.nextReviewAt)) {
      stats.dueToday++;
    }

    totalEF += card.easeFactor;
    totalCorrect += card.correctReviews;
    totalReviews += card.totalReviews;
  }

  if (cards.length > 0) {
    stats.averageEaseFactor =
      Math.round((totalEF / cards.length) * 100) / 100;
  }

  stats.averageRetention = calculateRetention(totalCorrect, totalReviews);

  return stats;
}
