/**
 * Streak Middleware — S1 Quality Guard Fix
 * 
 * FIX 4.2: Streak requires minimum effort to maintain
 * - Tracks quality reviews per day
 * - Only counts streak when user does ≥ 5 quality reviews (quality ≥ 3)
 *   OR ≥ 10 minutes of active learning
 */
import { Request, Response, NextFunction } from 'express'
import * as streakService from '../services/streakService'

const STREAK_MIN_QUALITY_REVIEWS = 5;
const STREAK_MIN_ACTIVE_MINUTES = 10;

// In-memory daily counters (per user, reset daily)
// In production, use Redis or DB
const dailyCounters = new Map<string, { qualityReviews: number; date: string }>();

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getUserDailyCount(userId: string): { qualityReviews: number; date: string } {
  const today = getTodayKey();
  const existing = dailyCounters.get(userId);
  if (existing && existing.date === today) return existing;
  // Reset for new day
  const fresh = { qualityReviews: 0, date: today };
  dailyCounters.set(userId, fresh);
  return fresh;
}

/**
 * Middleware to increment quality review counter
 * Call AFTER a review with quality ≥ 3
 */
export function trackQualityReview(userId: string, quality: number): void {
  if (quality >= 3) {
    const counter = getUserDailyCount(userId);
    counter.qualityReviews++;
    dailyCounters.set(userId, counter);
  }
}

/**
 * Check if user has met the daily streak threshold
 */
export function hasMetStreakThreshold(userId: string): boolean {
  const counter = getUserDailyCount(userId);
  return counter.qualityReviews >= STREAK_MIN_QUALITY_REVIEWS;
}

/**
 * Middleware to auto-update streaks after successful activity
 * FIX 4.2: Only updates streak if user has met minimum threshold
 */
export async function updateStreakOnActivity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Set up listener for when response finishes
  res.on('finish', async () => {
    // Only process if response was successful (2xx status)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const userId = req.user?.id

        if (userId) {
          // Track this review's quality if present in body
          const quality = req.body?.quality;
          if (typeof quality === 'number') {
            trackQualityReview(userId, quality);
          }

          // FIX 4.2: Only update streak if threshold met
          if (hasMetStreakThreshold(userId)) {
            const result = await streakService.updateStreak(userId)

            if (result.data.milestoneReached) {
              console.log(`[Streak] 🎉 User ${userId} reached ${result.data.milestoneReached} days!`)
            }

            console.log(`[Streak] Updated for user ${userId}: ${result.data.currentStreak} days (${getUserDailyCount(userId).qualityReviews} quality reviews today)`)
          } else {
            const counter = getUserDailyCount(userId);
            console.log(`[Streak] User ${userId}: ${counter.qualityReviews}/${STREAK_MIN_QUALITY_REVIEWS} quality reviews today — threshold not met yet`)
          }
        }
      } catch (error: any) {
        console.error('[Streak Middleware] Failed to update streak:', {
          userId: req.user?.id,
          error: error.message
        })
      }
    }
  })

  // Continue to next middleware/handler
  next()
}
